# Sistema Híbrido de Gestión de Matrículas de Laboratorio (UNSA)

Aplicativo móvil híbrido multiplataforma (Android/iOS) desarrollado con **React Native (Expo SDK 57)** bajo arquitectura **MVVM (Model-View-ViewModel)**, respaldado por un servidor backend en **FastAPI (Python)** y base de datos relacional desplegados en la nube mediante **Docker** en un servidor VPS.

---

## 👥 Información Académica
* **Institución:** Universidad Nacional de San Agustín de Arequipa (UNSA)
* **Facultad:** Facultad de Ingeniería de Producción y Servicios (FIPS)
* **Escuela:** Escuela Profesional de Ingeniería de Sistemas (EPIS)
* **Curso:** Plataformas Emergentes
* **Docente:** M. Sc. Ing. Rene Alonso Nieto Valencia
* **Autor:** Mendoza Hilasaca, Emerson Danny
* **Arequipa, 2026**

---

## 📱 Descarga del Ejecutable (APK)

El archivo ejecutable compilado para Android se encuentra disponible en la sección de **Releases** de este repositorio:
* 📦 **[Descargar App Matrículas v1.0.0 (APK)](https://github.com/MendozaEmerson/App-Matriculas/releases/tag/v1.0.0)**
* 🔗 **Enlace directo de compilación EAS:** [Descargar APK desde Expo Artifacts](https://expo.dev/artifacts/eas/P7-0OAyCU-7RPasrAmcTqiRDbZbZ3NOgoCsBbd1X1nM.apk)

> **Nota:** La aplicación se encuentra conectada al servidor VPS de producción en la nube (`http://194.163.144.149:8008`), permitiendo funcionamiento autónomo en cualquier dispositivo Android sin necesidad de ejecutar servidores locales.

---

## 📄 Documentación del Proyecto
El informe completo y formal del proyecto se encuentra versionado en la carpeta `docs/`:
* 📑 **[Informe del Proyecto en Formato PDF](docs/Informe_Matriculas_UNSA_Mendoza_Danny.pdf)**

---

## 🔑 Credenciales de Acceso para Pruebas

El sistema cuenta con autenticación por roles diferenciada:

### 1. Rol Administrador
* **Correo Institucional:** `admin@unsa.edu.pe`
* **Contraseña:** `12345678`
* **Funcionalidades:**
  * Carga masiva de asignaturas, grupos y estudiantes mediante archivos Excel (.xlsx).
  * Algoritmo de prevención y auditoría de duplicados (upsert con balance de registros).
  * Dashboard de Resumen con navegación por año académico.
  * Inspección en tiempo real de cada grupo de laboratorio con relación completa de alumnos inscritos (CUI, DNI, nombres).
  * Herramientas de edición de capacidad y gestión de cupos.

### 2. Rol Estudiante
* **Correo Institucional:** `eapazap@unsa.edu.pe`
* **Contraseña (CUI):** `12345678`
* **Funcionalidades:**
  * Malla académica interactiva con visualización de vacantes en tiempo real.
  * Matrícula instantánea con validación transaccional de cupos y prevención de cruces.
  * Pestaña *Mis Cursos* con asignaciones confirmadas.
  * **Generación y descarga de Constancia Oficial de Matrícula en PDF** con membrete UNSA y código de verificación electrónica.

---

## 🏛️ Arquitectura del Sistema

El proyecto implementa una separación estricta de responsabilidades bajo el patrón **MVVM (Model-View-ViewModel)** en el frontend y **RESTful API** en el backend:

```
App-Matriculas/
├── assets/                     # Recursos visuales e iconos adaptativos
├── backend/                    # Servidor API REST en FastAPI
│   ├── api/                    # Enrutadores (auth, courses, students, enrollments, summary)
│   ├── core/                   # Conexión a Base de Datos y motor SQLAlchemy
│   ├── models/                 # Modelos ORM (Student, Course, CourseGroup, Enrollment, UploadLog)
│   ├── Dockerfile              # Contenedor de producción Python 3.11 Slim
│   ├── requirements.txt        # Dependencias (FastAPI, Pandas, Openpyxl, ReportLab)
│   └── matriculas.db           # Base de datos relacional SQLite
├── docs/                       # Documentación formal e informes
│   └── Informe_Matriculas_UNSA_Mendoza_Danny.pdf
├── src/                        # Código fuente del Frontend móvil (React Native)
│   ├── app/                    # Enrutamiento basado en archivos (Expo Router)
│   │   ├── (admin)/            # Vistas del módulo de Administrador
│   │   ├── (auth)/             # Vista de Login y autenticación
│   │   └── (student)/          # Vistas del módulo de Estudiante
│   ├── config/                 # Configuración de red y URL del backend (VPS)
│   ├── models/                 # Interfaces y DTOs de TypeScript
│   ├── services/               # Clientes HTTP y comunicación REST
│   ├── store/                  # Estado global persistente (AsyncStorage)
│   └── viewmodels/             # Hooks de lógica de negocio (MVVM)
├── app.json                    # Configuración nativa de Expo y permisos de red
├── docker-compose.yml          # Orquestación de contenedores para despliegue
├── eas.json                    # Perfiles de compilación para generación de APK
└── package.json                # Dependencias de React Native y NativeWind
```

---

## 🛠️ Tecnologías Empleadas

* **Frontend Móvil:** React Native 0.86, Expo SDK 57, Expo Router 57, TypeScript, NativeWind (Tailwind CSS v3), Lucide React Native.
* **Componentes Nativos:** `View` (Flexbox responsive), `ScrollView`, `KeyboardAvoidingView`, `ActivityIndicator`, `expo-file-system`, `expo-sharing`.
* **Backend:** Python 3.11, FastAPI, Uvicorn, SQLAlchemy ORM, Pandas, OpenPyXL, ReportLab 5.0.
* **Infraestructura:** Docker, Docker Compose, Linux VPS (Contabo), SQLite relacional con volúmenes persistentes.

---

## 🚀 Despliegue Local (Desarrollo)

### 1. Iniciar el Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # En Windows (o source venv/bin/activate en Linux/Mac)
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Iniciar la App Móvil
```bash
npm install
npx expo start
```
Escanea el código QR desde la aplicación **Expo Go** o ejecuta en emulador de Android.
