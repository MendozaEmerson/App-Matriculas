import pandas as pd
from io import BytesIO
import unicodedata
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from core.database import get_db
from models.course import Course, CourseGroup
import io
import base64
from pydantic import BaseModel
from models.student import Student
from models.enrollment import Enrollment
from models.upload_log import UploadLog

router = APIRouter()

class UploadBase64Request(BaseModel):
    filename: str
    base64_data: str

class UpdateGroupRequest(BaseModel):
    name: str
    schedule_range: str
    initial_vacancies: int

class CreateGroupRequest(BaseModel):
    name: str
    schedule_range: str
    initial_vacancies: int

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment

@router.get("/template")
def download_courses_template():
    """Genera y descarga una plantilla Excel para subir cursos"""
    df = pd.DataFrame(columns=[
        'Código Teórico', 'Código Laboratorio', 'Nombre', 'Año', 
        'Semestre', 'Grupo', 'Horario', 'Vacantes'
    ])
    
    stream = io.BytesIO()
    with pd.ExcelWriter(stream, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Cursos')
        worksheet = writer.sheets['Cursos']
        
        # Ajustar anchos y estilizar la cabecera (Tabla azul)
        for i, col in enumerate(df.columns, 1):
            col_letter = chr(64 + i)
            worksheet.column_dimensions[col_letter].width = len(col) + 8
            
            cell = worksheet.cell(row=1, column=i)
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill(start_color="2563EB", end_color="2563EB", fill_type="solid") # Azul Tailwind
            cell.alignment = Alignment(horizontal="center", vertical="center")
            
    stream.seek(0)
    
    return StreamingResponse(
        stream, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=plantilla_cursos.xlsx"}
    )

@router.post("/upload_b64")
async def upload_courses_b64(request: UploadBase64Request, db: Session = Depends(get_db)):
    if not request.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos Excel (.xlsx)")
        
    try:
        contents = base64.b64decode(request.base64_data)
        return _process_courses_excel(contents, request.filename, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error procesando el Excel: {str(e)}")

@router.post("/upload")
async def upload_courses(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Recibe un archivo Excel (.xlsx).
    Agrupa los cursos y sus grupos (A, B, C...) insertándolos en la base de datos local SQLite.
    """
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos Excel (.xlsx)")
        
    contents = await file.read()
    try:
        return _process_courses_excel(contents, file.filename, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error procesando el Excel: {str(e)}")

def _find_col_val(row, candidate_names):
    """Busca el valor de una columna admitiendo múltiples variantes de nombres (sin distinguir mayúsculas/espacios/tildes)"""
    def normalize(s):
        s = unicodedata.normalize('NFKD', str(s)).encode('ASCII', 'ignore').decode('utf-8')
        return "".join(s.lower().split())

    norm_candidates = [normalize(c) for c in candidate_names]
    for key, val in row.items():
        if normalize(key) in norm_candidates:
            if pd.notna(val):
                return str(val).strip()
            return ""
    return ""

def _process_courses_excel(contents: bytes, filename: str, db: Session):
    # Leemos el Excel en memoria con Pandas
    df = pd.read_excel(BytesIO(contents))
    
    total_rows = len(df)
    courses_created = 0
    groups_created = 0
    duplicated_courses_count = 0
    duplicated_items = []
    
    for index, row in df.iterrows():
        theoretical_code = _find_col_val(row, [
            'Codigo Curso Teorico', 'Codigo Teorico', 'codigo_teorico', 'cod_teorico', 'theoretical_code'
        ])
        
        if not theoretical_code or theoretical_code == 'nan':
            continue
            
        course_name = _find_col_val(row, [
            'Nombre del Curso', 'Nombre', 'name', 'nombre_curso', 'asignatura'
        ])
        if not course_name or course_name == 'nan':
            course_name = f"Curso {theoretical_code}"
            
        lab_code = _find_col_val(row, [
            'Codigo Curso Lab', 'Codigo Curso Laboratorio', 'Codigo Laboratorio', 'codigo_lab', 'codigo_laboratorio', 'lab_code'
        ])
        if lab_code == 'nan':
            lab_code = ''
            
        year_str = _find_col_val(row, ['Ano', 'Año', 'year', 'ciclo'])
        semester_str = _find_col_val(row, ['Semestre', 'semester', 'sem'])
        
        try:
            year_val = int(year_str) if year_str else 1
        except ValueError:
            year_val = 1
            
        try:
            semester_val = int(semester_str) if semester_str else 1
        except ValueError:
            semester_val = 1
            
        # Validamos si el curso ya existe en la DB
        course = db.query(Course).filter(Course.theoretical_code == theoretical_code).first()
        if course:
            # Sincronización Inteligente: actualizar nombre, lab_code y datos del curso existente
            if course_name and course_name != f"Curso {theoretical_code}":
                course.name = course_name
            if lab_code: # Si en el Excel viene código de lab, se actualiza
                course.lab_code = lab_code
            course.year = year_val
            course.semester = semester_val
            
            duplicated_courses_count += 1
            duplicated_items.append({
                "identifier": theoretical_code,
                "name": course.name,
                "reason": "Asignatura ya registrada (datos y grupos sincronizados)"
            })
        else:
            course = Course(
                theoretical_code=theoretical_code,
                lab_code=lab_code,
                name=course_name,
                year=year_val,
                semester=semester_val
            )
            db.add(course)
            db.flush()
            courses_created += 1
            
        # Extraer grupos, horarios y vacantes
        groups_raw = _find_col_val(row, ['Grupos', 'Grupo', 'group', 'groups'])
        schedules_raw = _find_col_val(row, ['Horario por Grupo', 'Horario', 'horario', 'schedules'])
        vacancies_raw = _find_col_val(row, ['Vacantes por Grupo', 'Vacantes', 'vacancies', 'cupos'])
        
        groups_list = [g.strip() for g in groups_raw.split(',')] if groups_raw and groups_raw != 'nan' else []
        schedules_list = [s.strip() for s in schedules_raw.split(',')] if schedules_raw and schedules_raw != 'nan' else []
        vacancies_list = [v.strip() for v in vacancies_raw.split(',')] if vacancies_raw and vacancies_raw != 'nan' else []
        
        for i, group_name in enumerate(groups_list):
            if not group_name: continue
            
            schedule = schedules_list[i] if i < len(schedules_list) else ''
            vacancies_str = vacancies_list[i] if i < len(vacancies_list) else '0'
            
            try:
                vacancies_num = int(vacancies_str)
            except ValueError:
                vacancies_num = 0

            existing_group = db.query(CourseGroup).filter(
                CourseGroup.course_id == course.id,
                CourseGroup.name == group_name
            ).first()
            
            if not existing_group:
                group = CourseGroup(
                    course_id=course.id,
                    name=group_name,
                    schedule_range=schedule,
                    initial_vacancies=vacancies_num,
                    available_vacancies=vacancies_num
                )
                db.add(group)
                groups_created += 1
            else:
                # Si el grupo ya existía, sincronizar horario y cupos si no han sido modificados
                if schedule:
                    existing_group.schedule_range = schedule
                if vacancies_num > 0 and existing_group.initial_vacancies == 0:
                    existing_group.initial_vacancies = vacancies_num
                    existing_group.available_vacancies = vacancies_num
            
    # Guardar log de auditoría
    upload_log = UploadLog(
        upload_type='courses',
        filename=filename,
        total_rows=total_rows,
        created_count=courses_created,
        duplicated_count=duplicated_courses_count,
        duplicated_items=duplicated_items
    )
    db.add(upload_log)
    db.commit()
    
    return {
        "filename": filename,
        "status": "success",
        "total_rows": total_rows,
        "created_count": courses_created,
        "duplicated_count": duplicated_courses_count,
        "duplicated_items": duplicated_items,
        "message": f"Procesamiento completado: Se agregaron {courses_created} cursos nuevos y se omitieron {duplicated_courses_count} duplicados."
    }

@router.get("/upload_history")
def get_courses_upload_history(db: Session = Depends(get_db)):
    """Obtiene el historial de subidas de cursos y auditoría de duplicados"""
    logs = db.query(UploadLog).filter(UploadLog.upload_type == 'courses').order_by(UploadLog.created_at.desc()).limit(15).all()
    return [
        {
            "id": log.id,
            "upload_type": log.upload_type,
            "filename": log.filename,
            "total_rows": log.total_rows,
            "created_count": log.created_count,
            "duplicated_count": log.duplicated_count,
            "duplicated_items": log.duplicated_items or [],
            "created_at": log.created_at.isoformat() if log.created_at else ""
        }
        for log in logs
    ]

@router.get("/groups/{group_id}")
def get_group_details(group_id: int, db: Session = Depends(get_db)):
    """Obtiene los detalles del grupo y la lista de estudiantes inscritos"""
    group = db.query(CourseGroup).filter(CourseGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
        
    enrollments = db.query(Enrollment).filter(Enrollment.course_group_id == group_id).all()
    enrolled_cuis = [e.cui for e in enrollments]
    students = db.query(Student).filter(Student.cui.in_(enrolled_cuis)).all() if enrolled_cuis else []
    students_by_cui = {s.cui: s for s in students}
    
    student_list = []
    for e in enrollments:
        s = students_by_cui.get(e.cui)
        if s:
            student_list.append({
                "cui": s.cui,
                "dni": s.dni or e.dni or "",
                "first_name": s.first_name or "",
                "last_name": f"{s.paternal_surname or ''} {s.maternal_surname or ''}".strip(),
                "paternal_surname": s.paternal_surname or "",
                "maternal_surname": s.maternal_surname or "",
                "institutional_email": s.institutional_email or ""
            })
        else:
            student_list.append({
                "cui": e.cui,
                "dni": e.dni or "",
                "first_name": "Estudiante",
                "last_name": f"(CUI: {e.cui})",
                "paternal_surname": "",
                "maternal_surname": "",
                "institutional_email": ""
            })
            
    enrolled_count = len(enrollments)
    
    return {
        "id": group.id,
        "course_id": group.course_id,
        "course_name": group.course.name if group.course else "",
        "course_lab_code": group.course.lab_code if group.course else "",
        "course_year": group.course.year if group.course else 1,
        "name": group.name,
        "schedule_range": group.schedule_range or "",
        "initial_vacancies": group.initial_vacancies,
        "available_vacancies": group.available_vacancies,
        "enrolled_count": enrolled_count,
        "is_full": group.available_vacancies <= 0,
        "students": student_list
    }

@router.put("/groups/{group_id}")
def update_group(group_id: int, request: UpdateGroupRequest, db: Session = Depends(get_db)):
    """Modifica el nombre, horario y vacantes iniciales de un grupo"""
    group = db.query(CourseGroup).filter(CourseGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
        
    # Calcular alumnos actualmente matriculados para ajustar las vacantes disponibles
    enrolled_count = max(0, group.initial_vacancies - group.available_vacancies)
    
    group.name = request.name.strip()
    group.schedule_range = request.schedule_range.strip()
    group.initial_vacancies = request.initial_vacancies
    group.available_vacancies = max(0, request.initial_vacancies - enrolled_count)
    
    db.commit()
    db.refresh(group)
    
    return {
        "status": "success",
        "message": f"Grupo {group.name} actualizado correctamente",
        "group": {
            "id": group.id,
            "name": group.name,
            "schedule_range": group.schedule_range,
            "initial_vacancies": group.initial_vacancies,
            "available_vacancies": group.available_vacancies
        }
    }

@router.delete("/groups/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db)):
    """Elimina el grupo y desvincula las matrículas asociadas"""
    group = db.query(CourseGroup).filter(CourseGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
        
    group_name = group.name
    # Eliminar matrículas huérfanas de este grupo
    db.query(Enrollment).filter(Enrollment.course_group_id == group_id).delete()
    db.delete(group)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Grupo {group_name} eliminado correctamente"
    }

@router.post("/{course_id}/groups")
def create_group(course_id: int, request: CreateGroupRequest, db: Session = Depends(get_db)):
    """Crea un nuevo grupo para una asignatura específica"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Asignatura no encontrada")
        
    group = CourseGroup(
        course_id=course.id,
        name=request.name.strip(),
        schedule_range=request.schedule_range.strip(),
        initial_vacancies=request.initial_vacancies,
        available_vacancies=request.initial_vacancies
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    
    return {
        "status": "success",
        "message": f"Grupo {group.name} creado exitosamente",
        "group": {
            "id": group.id,
            "name": group.name,
            "schedule_range": group.schedule_range,
            "initial_vacancies": group.initial_vacancies,
            "available_vacancies": group.available_vacancies
        }
    }
