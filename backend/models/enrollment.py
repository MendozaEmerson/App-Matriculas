from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from core.database import Base
from sqlalchemy.orm import relationship

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    cui = Column(String, index=True)
    dni = Column(String(8), index=True)
    course_group_id = Column(Integer, ForeignKey("course_groups.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    group = relationship("CourseGroup")
