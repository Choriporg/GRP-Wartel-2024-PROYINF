from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware  # Importa el middleware de CORS
import pydicom as dcm
import numpy as np
import os
import cv2

app = FastAPI()


# Configurar el middleware CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las solicitudes de cualquier origen
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los encabezados
)

# Carpeta para almacenar archivos subidos y procesados
UPLOAD_DIR = "dicoms/"
PROCESSED_DIR = "processed/"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Función para ajustar el contraste de las imágenes DICOM y normalizar
def contrastar(image, umbral):
    try:
        # Asegurar que el pixel_array esté disponible
        pixel_array = image.pixel_array.astype(np.float32)
        
        # Normalizar al rango 0-255 (8 bits por canal)
        pixel_array = np.clip((pixel_array - np.min(pixel_array)) / (np.max(pixel_array) - np.min(pixel_array)) * 255, 0, 255)
        
        # Aplicar umbral de contraste
        pixel_array[pixel_array < umbral] = 0
        pixel_array[pixel_array >= umbral] = 255
        
        return pixel_array.astype(np.uint8)  # Asegurar 8 bits por canal
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")

# Ruta para subir múltiples imágenes DICOM y procesarlas
@app.post("/upload/")
async def upload_dicom(files: list[UploadFile] = File(...), umbral: int = 128):
    filenames = []
    for file in files:
        try:
            # Guardar cada archivo DICOM subido
            file_location = f"{UPLOAD_DIR}{file.filename}"
            with open(file_location, "wb+") as file_object:
                file_object.write(file.file.read())
            
            # Leer el archivo DICOM
            dicom_file = dcm.dcmread(file_location)

            # Verificar si tiene pixel_array (es una imagen válida)
            if not hasattr(dicom_file, 'pixel_array'):
                raise HTTPException(status_code=400, detail="El archivo no contiene datos de imagen DICOM válidos")
            
            # Ajustar el contraste de la imagen
            contrasted_img = contrastar(dicom_file, umbral)

            # Guardar la imagen procesada como PNG
            output_image_path = f"{PROCESSED_DIR}{file.filename}.png"
            cv2.imwrite(output_image_path, contrasted_img)

            filenames.append(file.filename)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al subir el archivo: {str(e)}")
    return {"filenames": filenames}

# Ruta para obtener la imagen con contraste aplicado
@app.get("/image/{filename}")
async def get_image(filename: str, umbral: int = 128):
    try:
        file_path = f"{UPLOAD_DIR}{filename}"
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
        # Leer el archivo DICOM
        dicom_file = dcm.dcmread(file_path)

        # Verificar si tiene pixel_array (es una imagen válida)
        if not hasattr(dicom_file, 'pixel_array'):
            raise HTTPException(status_code=400, detail="El archivo no contiene datos de imagen DICOM válidos")
        
        # Ajustar el contraste de la imagen
        contrasted_img = contrastar(dicom_file, umbral)

        # Guardar la imagen procesada como PNG
        output_image_path = f"{PROCESSED_DIR}{filename}.png"
        cv2.imwrite(output_image_path, contrasted_img)

        # Devolver la imagen procesada
        return FileResponse(output_image_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")

