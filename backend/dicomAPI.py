from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pydicom as dcm
import numpy as np
import os
import cv2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite cualquier origen (ajusta según tu caso)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Carpeta para almacenar archivos subidos y procesados
UPLOAD_DIR = "dicoms/"
PROCESSED_DIR = "processed/"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Función para ajustar el contraste de las imágenes DICOM
def contrastar(image, umbral):
    pixel_array = image.pixel_array
    pixel_array[pixel_array < umbral] = 0
    pixel_array[pixel_array >= umbral] = 255
    return pixel_array

# Ruta para subir una imagen DICOM y procesarla
@app.post("/upload/")
async def upload_dicom(file: UploadFile = File(...), umbral: int = 128):
    # Guardar el archivo DICOM subido
    file_location = f"{UPLOAD_DIR}{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    # Leer el archivo DICOM
    dicom_file = dcm.dcmread(file_location)
    
    # Ajustar el contraste de la imagen
    contrasted_img = contrastar(dicom_file, umbral)
    
    # Guardar la imagen procesada como PNG
    output_image_path = f"{PROCESSED_DIR}{file.filename}.png"
    cv2.imwrite(output_image_path, contrasted_img)
    
    return {"filename": file.filename, "processed_image_path": output_image_path}

# Ruta para descargar la imagen procesada
@app.get("/image/{filename}")
async def get_image(filename: str):
    file_path = f"{PROCESSED_DIR}{filename}.png"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}
