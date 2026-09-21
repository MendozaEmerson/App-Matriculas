from sqlalchemy import Column, Integer, String, JSON
from core.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    cui = Column(String, unique=True, index=True)
    dni = Column(String(8), unique=True, index=True)
    first_name = Column(String)
    paternal_surname = Column(String)
    maternal_surname = Column(String)
    institutional_email = Column(String, unique=True, index=True)
    
    # Lista de los códigos de los cursos teóricos inscritos (Guardado como JSON en SQLite)
    enrolled_course_codes = Column(JSON)
