from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.database import get_db
from models.student import Student

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Credenciales de administrador por defecto (CUI debe ser numérico)
    if request.email == "admin@unsa.edu.pe" and request.password == "12345678":
        return {"role": "admin", "message": "Bienvenido Administrador"}
        
    # Búsqueda de estudiante
    student = db.query(Student).filter(Student.institutional_email == request.email).first()
    
    # Contraseña = CUI según requerimiento
    if not student or student.cui != request.password:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
        
    return {
        "role": "student",
        "cui": student.cui,
        "dni": student.dni,
        "first_name": student.first_name,
        "last_name": f"{student.paternal_surname} {student.maternal_surname}",
        "message": f"Bienvenido {student.first_name}"
    }
