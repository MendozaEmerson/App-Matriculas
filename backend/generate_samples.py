import pandas as pd

# 1. Excel de Cursos
courses = [
    {
        "Codigo Curso Teorico": "1701101",
        "Codigo Curso Laboratorio": "1701101-LAB",
        "Nombre del Curso": "Física General",
        "Año": 1,
        "Semestre": 1,
        "Grupos": "A,B,C",
        "Horario por Grupo": "Lun 8-10, Mie 10-12, Vie 14-16",
        "Vacantes por Grupo": "2,2,2" # Pocas vacantes para probar que se llenan rápido
    },
    {
        "Codigo Curso Teorico": "1701102",
        "Codigo Curso Laboratorio": "", # Sin laboratorio (debe ser ignorado por el motor)
        "Nombre del Curso": "Matemática Básica",
        "Año": 1,
        "Semestre": 1,
        "Grupos": "",
        "Horario por Grupo": "",
        "Vacantes por Grupo": ""
    },
    {
        "Codigo Curso Teorico": "1702201",
        "Codigo Curso Laboratorio": "1702201-LAB",
        "Nombre del Curso": "Programación Orientada a Objetos",
        "Año": 2,
        "Semestre": 3,
        "Grupos": "A,B",
        "Horario por Grupo": "Mar 10-12, Jue 14-16",
        "Vacantes por Grupo": "15,15"
    }
]

df_courses = pd.DataFrame(courses)
df_courses.to_excel("ejemplo_cursos.xlsx", index=False)

# 2. Excel de Alumnos
students = [
    {
        "CUI": "12345678", # Fácil de recordar para login
        "DNI": "71234567",
        "Nombres": "Emerson",
        "Apellido Paterno": "Apaza",
        "Apellido Materno": "Perez",
        "Correo Institucional": "eapazap@unsa.edu.pe",
        "Codigos cursos inscritos": "1701101, 1701102, 1702201" # Está matriculado en los 3 teóricos
    },
    {
        "CUI": "87654321",
        "DNI": "78765432",
        "Nombres": "Maria",
        "Apellido Paterno": "Gomez",
        "Apellido Materno": "Lopez",
        "Correo Institucional": "mgomezl@unsa.edu.pe",
        "Codigos cursos inscritos": "1701101" # Solo está en Física
    },
    {
        "CUI": "11112222",
        "DNI": "71112222",
        "Nombres": "Juan",
        "Apellido Paterno": "Salas",
        "Apellido Materno": "Díaz",
        "Correo Institucional": "jsalasd@unsa.edu.pe",
        "Codigos cursos inscritos": "1702201"
    }
]

df_students = pd.DataFrame(students)
df_students.to_excel("ejemplo_alumnos.xlsx", index=False)

print("¡Archivos Excel generados exitosamente!")
