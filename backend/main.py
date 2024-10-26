from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import pydicom as dcm
import numpy as np
import cv2
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las solicitudes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carpetas para almacenar archivos subidos y procesados
UPLOAD_DIR = "dicoms/"
PROCESSED_DIR = "processed/"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Función para aplicar un colormap a la imagen
def aplicar_colormap(image, umbral):
    try:
        pixel_array = image.pixel_array.astype(np.uint8)
        colormap = cv2.COLORMAP_BONE  # Valor predeterminado
        if umbral == 50:
            colormap = cv2.COLORMAP_JET
        elif umbral == 128:
            colormap = cv2.COLORMAP_HOT
        elif umbral == 200:
            colormap = cv2.COLORMAP_OCEAN
        colored_img = cv2.applyColorMap(pixel_array, colormap)
        return colored_img
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al aplicar el colormap: {str(e)}")

# Ruta para subir archivos DICOM
@app.post("/upload/")
async def upload_dicom(files: list[UploadFile] = File(...)):
    filenames = []
    for file in files:
        try:
            file_location = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_location, "wb+") as file_object:
                file_object.write(file.file.read())
            filenames.append(file.filename)
            print(f"Archivo guardado en: {file_location}")
        except Exception as e:
            print(f"Error al subir el archivo: {e}")
            raise HTTPException(status_code=500, detail=f"Error al subir el archivo: {str(e)}")
    return {"filenames": filenames}

# Ruta para obtener la imagen procesada con colormap
@app.get("/image/{filename}")
async def get_image(filename: str, umbral: int = Query(None)):
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
        dicom_file = dcm.dcmread(file_path)
        colored_img = aplicar_colormap(dicom_file, umbral) if umbral is not None else dicom_file.pixel_array.astype(np.uint8)
        output_image_path = os.path.join(PROCESSED_DIR, f"{filename}.png")
        cv2.imwrite(output_image_path, colored_img)
        return FileResponse(output_image_path)
    except Exception as e:
        print(f"Error al procesar la imagen: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")

# Ruta para generar y descargar el PDF con anotaciones
@app.post("/download_pdf/")
async def download_pdf(filename: str, anotaciones: str):
    try:
        pdf_path = os.path.join(PROCESSED_DIR, f"{filename}_anotaciones.pdf")
        c = canvas.Canvas(pdf_path, pagesize=letter)
        c.drawString(100, 750, "Anotaciones:")
        y = 730
        for line in anotaciones.splitlines():
            c.drawString(100, y, line)
            y -= 20
        c.save()
        return FileResponse(pdf_path, media_type="application/pdf", filename=f"{filename}_anotaciones.pdf")
    except Exception as e:
        print(f"Error al generar el PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar el PDF: {str(e)}")


# Nueva ruta para obtener las dimensiones físicas del DICOM en mm
@app.get("/dimensions/{filename}")
async def get_dicom_dimensions(filename: str):
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)
        dicom_file = dcm.dcmread(file_path)
        pixel_spacing = dicom_file.PixelSpacing  # Espaciado entre píxeles en mm
        width_mm = dicom_file.Rows * pixel_spacing[0]
        height_mm = dicom_file.Columns * pixel_spacing[1]
        return {"width_mm": width_mm, "height_mm": height_mm, "pixel_spacing": pixel_spacing}
    except Exception as e:
        print(f"Error al obtener dimensiones del DICOM: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener dimensiones del DICOM: {str(e)}")



