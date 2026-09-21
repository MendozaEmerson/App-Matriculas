from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session
from core.database import get_db

router = APIRouter()

@router.post("/upload")
async def upload_courses(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Recibe un archivo Excel (.xlsx) o PDF (.pdf).
    Extraerá: año, semestre, vacantes, código único (7 digitos), lab, y grupos.
    """
    # TODO: Implementar extracción de datos con pandas/pdfplumber
    return {
        "filename": file.filename, 
        "status": "success", 
        "message": "Archivo de cursos recibido."
    }
