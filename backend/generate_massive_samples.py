import pandas as pd
import random

# 1. Excel de Cursos (Malla completa del 1er al 5to año)
courses = [
    # Año 1
    {"Codigo Curso Teorico": "1701101", "Codigo Curso Laboratorio": "1701101-LAB", "Nombre del Curso": "Matemática Discreta", "Año": 1, "Semestre": 1, "Grupos": "A,B,C,D", "Horario por Grupo": "Lun 8-10, Lun 10-12, Lun 14-16, Lun 16-18", "Vacantes por Grupo": "20,20,20,20"},
    {"Codigo Curso Teorico": "1701102", "Codigo Curso Laboratorio": "1701102-LAB", "Nombre del Curso": "Programación Web 1", "Año": 1, "Semestre": 1, "Grupos": "A,B", "Horario por Grupo": "Mar 8-10, Mar 10-12", "Vacantes por Grupo": "15,15"},
    {"Codigo Curso Teorico": "1701103", "Codigo Curso Laboratorio": "", "Nombre del Curso": "Comunicación Integral", "Año": 1, "Semestre": 1, "Grupos": "", "Horario por Grupo": "", "Vacantes por Grupo": ""},
    
    # Año 2
    {"Codigo Curso Teorico": "1702201", "Codigo Curso Laboratorio": "1702201-LAB", "Nombre del Curso": "Programación Orientada a Objetos", "Año": 2, "Semestre": 3, "Grupos": "A,B,C", "Horario por Grupo": "Mie 8-10, Mie 10-12, Mie 14-16", "Vacantes por Grupo": "20,20,20"},
    {"Codigo Curso Teorico": "1702202", "Codigo Curso Laboratorio": "1702202-LAB", "Nombre del Curso": "Base de Datos 1", "Año": 2, "Semestre": 3, "Grupos": "A,B", "Horario por Grupo": "Jue 8-10, Jue 10-12", "Vacantes por Grupo": "25,25"},
    
    # Año 3
    {"Codigo Curso Teorico": "1703301", "Codigo Curso Laboratorio": "1703301-LAB", "Nombre del Curso": "Arquitectura de Software", "Año": 3, "Semestre": 5, "Grupos": "A,B", "Horario por Grupo": "Vie 8-10, Vie 10-12", "Vacantes por Grupo": "15,15"},
    {"Codigo Curso Teorico": "1703302", "Codigo Curso Laboratorio": "1703302-LAB", "Nombre del Curso": "Sistemas Operativos", "Año": 3, "Semestre": 5, "Grupos": "A,B", "Horario por Grupo": "Lun 10-12, Mar 10-12", "Vacantes por Grupo": "30,30"},
    
    # Año 4
    {"Codigo Curso Teorico": "1704401", "Codigo Curso Laboratorio": "1704401-LAB", "Nombre del Curso": "Inteligencia Artificial", "Año": 4, "Semestre": 7, "Grupos": "A,B,C", "Horario por Grupo": "Mie 14-16, Jue 14-16, Vie 14-16", "Vacantes por Grupo": "10,10,10"}, # Pocas vacantes para probar que se llenan
    {"Codigo Curso Teorico": "1704402", "Codigo Curso Laboratorio": "1704402-LAB", "Nombre del Curso": "Plataformas Emergentes", "Año": 4, "Semestre": 7, "Grupos": "A,B", "Horario por Grupo": "Lun 18-20, Mar 18-20", "Vacantes por Grupo": "20,20"},
    
    # Año 5
    {"Codigo Curso Teorico": "1705501", "Codigo Curso Laboratorio": "1705501-LAB", "Nombre del Curso": "Proyecto de Tesis 1", "Año": 5, "Semestre": 9, "Grupos": "A", "Horario por Grupo": "Sab 8-12", "Vacantes por Grupo": "40"}
]

df_courses = pd.DataFrame(courses)
df_courses.to_excel("ejemplo_cursos_masivo.xlsx", index=False)

# 2. Excel de Alumnos (Generamos 30 alumnos)
nombres = ["Juan", "María", "Carlos", "Ana", "Luis", "Elena", "Pedro", "Lucía", "Jorge", "Sofía", "Diego", "Carmen", "Fernando", "Rosa", "Ricardo"]
apellidos = ["García", "Rodríguez", "López", "Pérez", "González", "Gómez", "Fernández", "Díaz", "Martínez", "Sánchez", "Romero", "Torres", "Suárez", "Vargas", "Rojas"]

students = []
# Mantener a los alumnos de prueba originales
students.extend([
    {"CUI": "12345678", "DNI": "71234567", "Nombres": "Emerson", "Apellido Paterno": "Apaza", "Apellido Materno": "Perez", "Correo Institucional": "eapazap@unsa.edu.pe", "Codigos cursos inscritos": "1701101, 1701102"},
    {"CUI": "87654321", "DNI": "78765432", "Nombres": "Maria", "Apellido Paterno": "Gomez", "Apellido Materno": "Lopez", "Correo Institucional": "mgomezl@unsa.edu.pe", "Codigos cursos inscritos": "1702201, 1702202"},
])

# Generar 28 alumnos más
for i in range(1, 29):
    nombre = random.choice(nombres)
    paterno = random.choice(apellidos)
    materno = random.choice(apellidos)
    cui = str(20230000 + i)
    dni = str(70000000 + i)
    
    # Asignarles cursos aleatorios de la malla
    cursos_inscritos = random.sample([c["Codigo Curso Teorico"] for c in courses], k=random.randint(2, 5))
    
    students.append({
        "CUI": cui,
        "DNI": dni,
        "Nombres": nombre,
        "Apellido Paterno": paterno,
        "Apellido Materno": materno,
        "Correo Institucional": "", # Se auto-generará en el backend
        "Codigos cursos inscritos": ", ".join(cursos_inscritos)
    })

df_students = pd.DataFrame(students)
df_students.to_excel("ejemplo_alumnos_masivo.xlsx", index=False)

print("¡Archivos Excel masivos generados exitosamente en la carpeta backend!")
