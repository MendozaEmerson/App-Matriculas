from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from models import course, student, enrollment
from api import courses, students, auth, summary, enrollments

# Crear las tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="App Matriculas API", description="API para el procesamiento de matrículas y carga masiva de datos.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(summary.router, prefix="/api/admin/summary", tags=["Admin Summary"])
app.include_router(enrollments.router, prefix="/api/student", tags=["Enrollments"])
app.include_router(courses.router, prefix="/api/courses", tags=["Cursos"])
app.include_router(students.router, prefix="/api/students", tags=["Estudiantes"])

@app.get("/")
def read_root():
    return {"message": "API de Matrículas funcionando correctamente"}
