from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.database import get_db
from models.student import Student
from models.course import Course, CourseGroup
from models.enrollment import Enrollment

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
