from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import FileResponse
import pydicom as dcm
import numpy as np
import os
import cv2

app = FastAPI()

# Carpeta para almacenar archivos subidos y procesados
UPLOAD_DIR = "dicoms/"
PROCESSED_DIR = "processed/"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Función para ajustar el contraste de las imágenes DICOM y normalizar
def contrastar(image, umbral):
    # Escalar los valores de los píxeles al rango 0-255 (8 bits por canal)
    pixel_array = image.pixel_array.astype(np.float32)
    pixel_array = np.clip((pixel_array - np.min(pixel_array)) / (np.max(pixel_array) - np.min(pixel_array)) * 255, 0, 255)
    
    # Aplicar umbral de contraste
    pixel_array[pixel_array < umbral] = 0
    pixel_array[pixel_array >= umbral] = 255
    
    return pixel_array.astype(np.uint8)  # Asegurarse de que la imagen sea de 8 bits

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
    
    # Si la imagen tiene solo un canal (escala de grises), asegúrate de guardarla correctamente
    if len(contrasted_img.shape) == 2:
        cv2.imwrite(output_image_path, contrasted_img)  # Guardar como escala de grises
    else:
        cv2.imwrite(output_image_path, cv2.cvtColor(contrasted_img, cv2.COLOR_GRAY2RGB))  # Convertir a RGB si es necesario
    
    return {"filename": file.filename, "processed_image_path": output_image_path}

# Ruta para obtener la imagen con contraste aplicado
@app.get("/image/{filename}")
async def get_image(filename: str, umbral: int = Query(128)):
    file_path = f"{UPLOAD_DIR}{filename}"
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    
    # Leer el archivo DICOM
    dicom_file = dcm.dcmread(file_path)

    # Ajustar el contraste de la imagen
    contrasted_img = contrastar(dicom_file, umbral)

    # Guardar la imagen procesada como PNG
    output_image_path = f"{PROCESSED_DIR}{filename}.png"
    
    # Si la imagen tiene solo un canal (escala de grises), asegúrate de guardarla correctamente
    if len(contrasted_img.shape) == 2:
        cv2.imwrite(output_image_path, contrasted_img)  # Guardar como escala de grises
    else:
        cv2.imwrite(output_image_path, cv2.cvtColor(contrasted_img, cv2.COLOR_GRAY2RGB))  # Convertir a RGB si es necesario
    
    # Devolver la imagen procesada
    return FileResponse(output_image_path)
