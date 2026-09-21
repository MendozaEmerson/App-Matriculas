from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.course import Course

router = APIRouter()

@router.get("/")
def get_admin_summary(db: Session = Depends(get_db)):
    """
    Retorna la estructura jerárquica de la información para el Administrador:
    Año -> Cursos -> Grupos
    Solo incluye cursos que tienen laboratorios (lab_code válido).
    """
    courses = db.query(Course).all()
    
    summary = {}
    for c in courses:
        # Ignorar cursos sin código de laboratorio según requerimiento
        if not c.lab_code or str(c.lab_code).strip() == "" or str(c.lab_code).lower() == "nan":
            continue
            
        year_str = str(c.year)
        if year_str not in summary:
            summary[year_str] = {"year": c.year, "courses": []}
            
        course_data = {
            "id": c.id,
            "theoretical_code": c.theoretical_code,
            "lab_code": c.lab_code,
            "name": c.name,
            "semester": c.semester,
            "groups": []
        }
        
        for g in c.groups:
            course_data["groups"].append({
                "id": g.id,
                "name": g.name,
                "schedule_range": g.schedule_range,
                "initial_vacancies": g.initial_vacancies,
                "available_vacancies": g.available_vacancies,
                "is_full": g.available_vacancies <= 0
            })
            
        summary[year_str]["courses"].append(course_data)
        
    # Convertir a lista y ordenar por año
    return sorted(list(summary.values()), key=lambda x: x["year"])
