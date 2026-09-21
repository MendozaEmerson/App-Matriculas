from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de la base de datos PostgreSQL
# IMPORTANTE: Reemplazar con las credenciales reales de tu VPS
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost:5432/matriculas"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
