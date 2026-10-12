import pandas as pd
from io import BytesIO
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

def _process_courses_excel(contents: bytes, filename: str, db: Session):
    # Leemos el Excel en memoria con Pandas
    df = pd.read_excel(BytesIO(contents))
    
    total_rows = len(df)
    courses_created = 0
    groups_created = 0
    duplicated_courses_count = 0
    duplicated_items = []
    
    for index, row in df.iterrows():
        # Buscar el código teórico con múltiples posibles nombres
        theoretical_code = str(row.get('Código Teórico', row.get('codigo_teorico', row.get('Codigo Curso Teorico', '')))).strip()
        
        if not theoretical_code or theoretical_code == 'nan':
            continue
            
        course_name = str(row.get('Nombre', row.get('name', row.get('Nombre del Curso', '')))).strip()
        if not course_name or course_name == 'nan':
            course_name = f"Curso {theoretical_code}"
            
        # Validamos si el curso ya existe en la DB
        course = db.query(Course).filter(Course.theoretical_code == theoretical_code).first()
        if course:
            duplicated_courses_count += 1
            duplicated_items.append({
                "identifier": theoretical_code,
                "name": course.name or course_name,
                "reason": "Asignatura ya registrada previamente en el sistema"
            })
        else:
            year_val = row.get('Año', row.get('year', 1))
            semester_val = row.get('Semestre', row.get('semester', 1))
            lab_code = str(row.get('Código Laboratorio', row.get('codigo_laboratorio', row.get('Codigo Curso Laboratorio', '')))).strip()
            
            course = Course(
                theoretical_code=theoretical_code,
                lab_code=lab_code if lab_code != 'nan' else '',
                name=course_name,
                year=int(year_val) if not pd.isna(year_val) else 1,
                semester=int(semester_val) if not pd.isna(semester_val) else 1
            )
            db.add(course)
            db.flush()
            courses_created += 1
            
        # Extraer grupos, horarios y vacantes (pueden venir separados por comas)
        groups_raw = str(row.get('Grupo', row.get('Grupos', row.get('group', 'A')))).strip()
        schedules_raw = str(row.get('Horario', row.get('Horario por Grupo', row.get('horario', '')))).strip()
        vacancies_raw = str(row.get('Vacantes', row.get('Vacantes por Grupo', row.get('vacancies', '0')))).strip()
        
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
    
    enrolled_count = max(0, group.initial_vacancies - group.available_vacancies)
    
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
        "students": [
            {
                "cui": s.cui,
                "dni": s.dni,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "institutional_email": s.institutional_email
            }
            for s in students
        ]
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
