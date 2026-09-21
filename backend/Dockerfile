# Usar una imagen oficial de Python ligera
FROM python:3.11-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo de requerimientos
COPY requirements.txt .

# Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código del backend
COPY . .

# Exponer el puerto donde correrá FastAPI
EXPOSE 8000

# Comando para arrancar el servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
