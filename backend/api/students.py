from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session
from core.database import get_db

router = APIRouter()

@router.post("/upload")
async def upload_students(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Recibe un archivo de estudiantes.
    Extraerá: CUI, DNI, Nombres, Apellidos, Códigos de Cursos inscritos y Correo Institucional.
    """
    # TODO: Implementar extracción de datos
    return {
        "filename": file.filename, 
        "status": "success", 
        "message": "Archivo de estudiantes recibido."
    }
