from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    theoretical_code = Column(String(7), unique=True, index=True)
    lab_code = Column(String)
    name = Column(String)
    year = Column(Integer)
    semester = Column(Integer)
    
    groups = relationship("CourseGroup", back_populates="course", cascade="all, delete-orphan")

class CourseGroup(Base):
    __tablename__ = "course_groups"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    name = Column(String) # Ej: "A", "B", "C"
    schedule_range = Column(String)
    initial_vacancies = Column(Integer)
    available_vacancies = Column(Integer)

    course = relationship("Course", back_populates="groups")
