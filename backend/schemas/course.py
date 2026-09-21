from pydantic import BaseModel, constr
from typing import List, Optional

class CourseGroupBase(BaseModel):
    name: str
    schedule_range: str
    initial_vacancies: int
    available_vacancies: int

class CourseGroupCreate(CourseGroupBase):
    pass

class CourseGroup(CourseGroupBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    theoretical_code: constr(min_length=7, max_length=7)
    lab_code: str
    name: str
    year: int
    semester: int

class CourseCreate(CourseBase):
    groups: List[CourseGroupCreate]

class Course(CourseBase):
    id: int
    groups: List[CourseGroup]

    class Config:
        from_attributes = True
