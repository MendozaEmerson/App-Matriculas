import io
import datetime
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.database import get_db
from models.student import Student
from models.course import Course, CourseGroup
from models.enrollment import Enrollment

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

router = APIRouter()

@router.get("/{cui}/courses")
def get_student_courses(cui: str, db: Session = Depends(get_db)):
    """
    Cruza los cursos teóricos del estudiante con la tabla de Cursos y devuelve:
    1. pending: Cursos (con laboratorio) donde aún no se matriculó en un grupo.
    2. enrolled: Cursos donde ya tiene matrícula en un grupo de laboratorio.
    """
    student = db.query(Student).filter(Student.cui == cui).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    theoretical_codes = student.enrolled_course_codes or []
    if not theoretical_codes:
        return {"pending": [], "enrolled": []}
        
    # Buscar todos los cursos que coinciden con sus teóricos Y tienen laboratorio
    all_courses = db.query(Course).filter(
        Course.theoretical_code.in_(theoretical_codes),
        Course.lab_code.isnot(None),
        Course.lab_code != "",
        Course.lab_code != "nan"
    ).all()
    
    # Buscar matrículas actuales del alumno
    enrollments = db.query(Enrollment).filter(Enrollment.cui == cui).all()
    enrolled_group_ids = [e.course_group_id for e in enrollments]
    
    pending_courses = []
    enrolled_courses = []
    
    for c in all_courses:
        # Verificar si algún grupo de este curso está en las matrículas del alumno
        is_enrolled_in_this_course = False
        enrolled_group = None
        
        for g in c.groups:
            if g.id in enrolled_group_ids:
                is_enrolled_in_this_course = True
                enrolled_group = g
                break
                
        course_data = {
            "id": c.id,
            "theoretical_code": c.theoretical_code,
            "lab_code": c.lab_code,
            "name": c.name,
            "year": c.year,
            "semester": c.semester,
            "groups": [{
                "id": g.id,
                "name": g.name,
                "schedule_range": g.schedule_range,
                "initial_vacancies": g.initial_vacancies,
                "available_vacancies": g.available_vacancies,
                "is_full": g.available_vacancies <= 0
            } for g in c.groups]
        }
        
        if is_enrolled_in_this_course:
            # Añadir información del grupo matriculado
            course_data["enrolled_group"] = {
                "id": enrolled_group.id,
                "name": enrolled_group.name,
                "schedule_range": enrolled_group.schedule_range
            }
            enrolled_courses.append(course_data)
        else:
            pending_courses.append(course_data)
            
    return {
        "pending": pending_courses,
        "enrolled": enrolled_courses
    }

class EnrollRequest(BaseModel):
    cui: str
    group_id: int

@router.post("/enroll")
def enroll_student(request: EnrollRequest, db: Session = Depends(get_db)):
    """
    Registra a un estudiante en un grupo de laboratorio si hay cupo y si no está ya matriculado.
    """
    # 1. Verificar estudiante
    student = db.query(Student).filter(Student.cui == request.cui).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    # 2. Verificar grupo y cupos
    group = db.query(CourseGroup).filter(CourseGroup.id == request.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
        
    if group.available_vacancies <= 0:
        raise HTTPException(status_code=400, detail="El grupo ya no tiene vacantes disponibles")
        
    # 3. Verificar si ya está matriculado en ESTE grupo
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.cui == request.cui,
        Enrollment.course_group_id == group.id
    ).first()
    
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Ya estás matriculado en este grupo")
        
    # 4. Verificar bloqueo de grupos dobles (si ya está en el Grupo A, bloquear el B)
    # Buscar todos los grupos del mismo curso
    course_groups_ids = [g.id for g in group.course.groups]
    
    other_enrollment = db.query(Enrollment).filter(
        Enrollment.cui == request.cui,
        Enrollment.course_group_id.in_(course_groups_ids)
    ).first()
    
    if other_enrollment:
        raise HTTPException(status_code=400, detail="Ya estás matriculado en otro grupo de este mismo curso")
        
    # 5. Ejecutar matrícula (Transaccional)
    new_enrollment = Enrollment(
        cui=student.cui,
        dni=student.dni,
        course_group_id=group.id
    )
    
    group.available_vacancies -= 1
    
    db.add(new_enrollment)
    db.commit()
    
    return {"status": "success", "message": f"Te has matriculado exitosamente en el grupo {group.name} de {group.course.name}"}

@router.get("/{cui}/constancia-pdf")
def generate_constancia_pdf(cui: str, db: Session = Depends(get_db)):
    """
    Genera y descarga en PDF la Constancia Oficial de Matrícula de Laboratorios
    con membrete formal de la UNSA, tabla de datos del alumno y asignaturas inscritas.
    """
    student = db.query(Student).filter(Student.cui == cui).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
    theoretical_codes = student.enrolled_course_codes or []
    all_courses = db.query(Course).filter(
        Course.theoretical_code.in_(theoretical_codes),
        Course.lab_code.isnot(None),
        Course.lab_code != "",
        Course.lab_code != "nan"
    ).all() if theoretical_codes else []
    
    enrollments = db.query(Enrollment).filter(Enrollment.cui == cui).all()
    enrolled_group_ids = [e.course_group_id for e in enrollments]
    
    enrolled_items = []
    pending_items = []
    
    for c in all_courses:
        found_group = None
        for g in c.groups:
            if g.id in enrolled_group_ids:
                found_group = g
                break
        if found_group:
            enrolled_items.append({
                "theoretical_code": c.theoretical_code,
                "lab_code": c.lab_code,
                "name": c.name,
                "year": c.year,
                "group_name": found_group.name,
                "schedule_range": found_group.schedule_range or "Horario no asignado"
            })
        else:
            all_groups_full = all(g.available_vacancies <= 0 for g in c.groups) if c.groups else True
            pending_items.append({
                "theoretical_code": c.theoretical_code,
                "lab_code": c.lab_code,
                "name": c.name,
                "year": c.year,
                "all_full": all_groups_full
            })
            
    # Buffer en memoria para el PDF
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    normal = styles['Normal']
    
    header_title = ParagraphStyle(
        'HT', parent=normal, fontName='Helvetica-Bold', fontSize=13, leading=16,
        alignment=TA_CENTER, textColor=colors.HexColor('#0f172a')
    )
    header_sub = ParagraphStyle(
        'HS', parent=normal, fontName='Helvetica-Bold', fontSize=9, leading=12,
        alignment=TA_CENTER, textColor=colors.HexColor('#475569')
    )
    header_small = ParagraphStyle(
        'HSm', parent=normal, fontName='Helvetica', fontSize=7.5, leading=10,
        alignment=TA_CENTER, textColor=colors.HexColor('#64748b')
    )
    doc_title = ParagraphStyle(
        'DT', parent=normal, fontName='Helvetica-Bold', fontSize=12, leading=15,
        alignment=TA_CENTER, textColor=colors.HexColor('#065f46')
    )
    section_title = ParagraphStyle(
        'ST', parent=normal, fontName='Helvetica-Bold', fontSize=10, leading=13,
        textColor=colors.HexColor('#0f172a')
    )
    th_style = ParagraphStyle(
        'TH', parent=normal, fontName='Helvetica-Bold', fontSize=8, leading=10,
        textColor=colors.white, alignment=TA_CENTER
    )
    td_style = ParagraphStyle(
        'TD', parent=normal, fontName='Helvetica', fontSize=8, leading=10.5,
        textColor=colors.HexColor('#1e293b')
    )
    td_bold = ParagraphStyle(
        'TDB', parent=normal, fontName='Helvetica-Bold', fontSize=8, leading=10.5,
        textColor=colors.HexColor('#0f172a')
    )
    td_center = ParagraphStyle(
        'TDC', parent=normal, fontName='Helvetica', fontSize=8, leading=10.5,
        alignment=TA_CENTER, textColor=colors.HexColor('#1e293b')
    )
    td_badge = ParagraphStyle(
        'TDBadge', parent=normal, fontName='Helvetica-Bold', fontSize=8, leading=10.5,
        alignment=TA_CENTER, textColor=colors.HexColor('#047857')
    )
    footer_text = ParagraphStyle(
        'FT', parent=normal, fontName='Helvetica', fontSize=7, leading=9.5,
        alignment=TA_CENTER, textColor=colors.HexColor('#64748b')
    )
    
    story = []
    
    # 1. Membrete Institucional
    story.append(Paragraph("UNIVERSIDAD NACIONAL DE SAN AGUSTÍN DE AREQUIPA", header_title))
    story.append(Spacer(1, 2))
    story.append(Paragraph("VICERRECTORADO ACADÉMICO • DIRECCIÓN DE GESTIÓN Y MATRÍCULA", header_sub))
    story.append(Spacer(1, 1))
    story.append(Paragraph("SISTEMA DE ASIGNACIÓN Y CONTROL DE LABORATORIOS", header_small))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#059669'), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph("CONSTANCIA OFICIAL DE MATRÍCULA DE LABORATORIOS", doc_title))
    story.append(Spacer(1, 10))
    
    # 2. Ficha de Datos del Estudiante
    full_name = f"{student.paternal_surname or ''} {student.maternal_surname or ''}, {student.first_name or ''}".strip().upper()
    now_str = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    
    status_label = "MATRÍCULA CONCLUIDA - REGULAR" if len(pending_items) == 0 else "CONCLUIDA (ASIGNATURAS PENDIENTES SIN CUPOS)"
    status_color = "#047857" if len(pending_items) == 0 else "#b45309"
    
    student_table_data = [
        [
            Paragraph(f"<b>CUI:</b> {student.cui}", td_style),
            Paragraph(f"<b>DNI:</b> {student.dni or 'No registrado'}", td_style)
        ],
        [
            Paragraph(f"<b>Estudiante:</b> {full_name}", td_bold),
            Paragraph(f"<b>Correo Institucional:</b> {student.institutional_email or ''}", td_style)
        ],
        [
            Paragraph("<b>Periodo Académico:</b> Semestre 2026-A", td_style),
            Paragraph(f"<b>Fecha de Emisión:</b> {now_str}", td_style)
        ],
        [
            Paragraph(f"<b>Laboratorios Matriculados:</b> {len(enrolled_items)} asignaturas", td_style),
            Paragraph(f"<b>Estado:</b> <font color=\"{status_color}\"><b>{status_label}</b></font>", td_style)
        ]
    ]
    t_student = Table(student_table_data, colWidths=[270, 270])
    t_student.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_student)
    story.append(Spacer(1, 14))
    
    # 3. Tabla de Cursos Matriculados
    story.append(Paragraph("RELACIÓN DE LABORATORIOS MATRICULADOS", section_title))
    story.append(Spacer(1, 6))
    
    if enrolled_items:
        courses_table_data = [
            [
                Paragraph("Cód. Teórico", th_style),
                Paragraph("Cód. Lab", th_style),
                Paragraph("Asignatura", th_style),
                Paragraph("Año", th_style),
                Paragraph("Grupo", th_style),
                Paragraph("Horario de Laboratorio", th_style)
            ]
        ]
        
        for idx, item in enumerate(enrolled_items):
            courses_table_data.append([
                Paragraph(item["theoretical_code"], td_center),
                Paragraph(item["lab_code"], td_center),
                Paragraph(item["name"], td_bold),
                Paragraph(f"Año {item['year']}", td_center),
                Paragraph(f"Grupo {item['group_name']}", td_badge),
                Paragraph(item["schedule_range"], td_style)
            ])
            
        t_courses = Table(courses_table_data, colWidths=[65, 75, 175, 40, 55, 130])
        
        t_style = [
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#047857')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]
        for row_idx in range(1, len(courses_table_data)):
            bg = colors.HexColor('#f8fafc') if row_idx % 2 == 1 else colors.white
            t_style.append(('BACKGROUND', (0, row_idx), (-1, row_idx), bg))
            
        t_courses.setStyle(TableStyle(t_style))
        story.append(t_courses)
    else:
        story.append(Paragraph("<i>No se registran matrículas de laboratorio en este periodo.</i>", td_style))
        
    story.append(Spacer(1, 14))
    
    # 4. Asignaturas Pendientes (si aplica por falta de cupos)
    if pending_items:
        story.append(Paragraph("ASIGNATURAS NO MATRICULADAS (SIN VACANTES DISPONIBLES)", section_title))
        story.append(Spacer(1, 5))
        pending_table_data = [
            [
                Paragraph("Cód. Teórico", th_style),
                Paragraph("Cód. Lab", th_style),
                Paragraph("Asignatura", th_style),
                Paragraph("Condición", th_style)
            ]
        ]
        for p in pending_items:
            pending_table_data.append([
                Paragraph(p["theoretical_code"], td_center),
                Paragraph(p["lab_code"], td_center),
                Paragraph(p["name"], td_bold),
                Paragraph("<font color=\"#dc2626\"><b>Sin vacantes disponibles en los grupos programados</b></font>", td_style)
            ])
        t_pending = Table(pending_table_data, colWidths=[70, 80, 210, 180])
        p_style = [
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#b45309')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#fffbeb'))
        ]
        t_pending.setStyle(TableStyle(p_style))
        story.append(t_pending)
        story.append(Spacer(1, 14))
        
    # 5. Código de Verificación y Pie de Página
    hash_seed = f"{student.cui}-{now_str}-{len(enrolled_items)}"
    token = hashlib.sha256(hash_seed.encode()).hexdigest()[:16].upper()
    
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=6))
    
    verif_data = [
        [
            Paragraph(f"<b>CÓDIGO DE VERIFICACIÓN ELECTRÓNICA:</b> <font color=\"#047857\"><b>UNSA-CONST-{token[:4]}-{token[4:8]}-{token[8:12]}</b></font>", footer_text),
        ],
        [
            Paragraph("Documento oficial expedido de forma digital por el Sistema de Asignación de Laboratorios de la Universidad Nacional de San Agustín de Arequipa. Válido para control de asistencia y verificación docente.", footer_text)
        ]
    ]
    t_verif = Table(verif_data, colWidths=[540])
    t_verif.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(t_verif)
    
    # Construir documento
    doc.build(story)
    buf.seek(0)
    
    filename = f"constancia_matricula_{student.cui}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
