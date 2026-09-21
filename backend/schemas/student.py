from pydantic import BaseModel, EmailStr, constr
from typing import List, Optional

class StudentBase(BaseModel):
    cui: str
    dni: constr(min_length=8, max_length=8)
    first_name: str
    paternal_surname: str
    maternal_surname: str
    institutional_email: EmailStr
    enrolled_course_codes: List[str]

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int

    class Config:
        from_attributes = True
