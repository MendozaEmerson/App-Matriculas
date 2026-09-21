from fastapi import FastAPI
from core.database import engine, Base
from models import course, student
from api import courses, students

# Crear las tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="App Matriculas API", description="API para el procesamiento de matrículas y carga masiva de datos.")

# Registrar las rutas (endpoints)
app.include_router(courses.router, prefix="/api/courses", tags=["Cursos"])
app.include_router(students.router, prefix="/api/students", tags=["Estudiantes"])

@app.get("/")
def read_root():
    return {"message": "API de Matrículas funcionando correctamente"}
