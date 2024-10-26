# DICOM Viewer - Matrix Style📼

Este proyecto es una aplicación web para visualizar y trabajar con imágenes DICOM, inspirada en la estética de la película *Matrix* (1999). Ofrece funcionalidades avanzadas como selección de puntos para medir distancias, anotaciones en PDF, control de zoom y ajuste de contraste mediante colormaps (el proyecto sigue en desarrollo por lo que habrá mas funcionalidades).

## Características

- **Visualización de imágenes DICOM** en un estilo visual de *Matrix*.
- **Selección de puntos** para medir la distancia en milímetros.
- **Zoom y ajuste de contraste** mediante colormaps.
- **Sección de anotaciones** que se puede descargar en PDF.
- **Soporte para navegar entre imágenes** usando las teclas de flechas.

## Requerimientos

- **Python 3.7+**
- **Node.js** y **npm**
- **FastAPI** como servidor backend
- **React** como framework de frontend
- **Dependencias adicionales**:
  - `pydicom`, `opencv-python`, `reportlab` para el backend.
  - `axios` para manejar las solicitudes en el frontend.

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Choriporg/GRP-Wartel-2024-PROYINF.git
cd GRP-Wartel-2024-PROYINF
```

### 2. Configuración del Backend

#### Crear un Entorno Virtual e Instalar Dependencias

```bash
python -m venv env
source env/bin/activate  # En Windows: env\Scripts\activate
pip install fastapi uvicorn pydicom opencv-python reportlab
```

#### Ejecutar el Servidor Backend

El servidor estará configurado para ejecutarse en el puerto `8000`.

```bash
uvicorn main:app --reload --port 8000
```

### 3. Configuración del Frontend

#### Instalar Dependencias de Node

```bash
cd frontend  # Navega al directorio del frontend
npm install
```

#### Ejecutar el Servidor de Desarrollo

```bash
npm start
```

El frontend se ejecutará en `http://localhost:3000`.

## Estructura del Proyecto

```
/project-root
├── /src
│   ├── /components
│   │   ├── DicomViewer.js      # Componente principal de visualización de DICOM
│   │   └── UploadView.js       # Componente para cargar archivos
│   ├── /styles
│   │   └── style.css           # Estilo inspirado en Matrix
│   └── App.js                  # Configuración principal del frontend
├── /backend
│   ├── main.py                 # API FastAPI para procesar imágenes DICOM
│   └── dicoms/                 # Carpeta para almacenar archivos subidos
├── README.md
└── package.json                # Dependencias de Node.js
```

## Uso de la Aplicación

### Funcionalidades Principales

1. **Subir una Imagen DICOM**
   - Usa el componente `UploadView` para seleccionar archivos DICOM desde tu computadora.

2. **Visualizar y Manipular la Imagen**
   - En la pantalla principal se muestra la imagen DICOM, con botones para aplicar colormaps (contraste) y ajustar el zoom.

3. **Seleccionar Puntos y Medir Distancia**
   - Haz clic en dos puntos cualesquiera de la imagen para ver una línea entre ellos y la distancia en milímetros (calculada según el espaciado de píxeles del archivo DICOM).

4. **Escribir Anotaciones y Descargar en PDF**
   - Escribe anotaciones en el cuadro de texto de la derecha y haz clic en "Descargar PDF" para guardar un archivo con las anotaciones y detalles del paciente.

### Controles del Teclado

- **Flechas Izquierda/Derecha**: Cambiar entre las imágenes cargadas.
- **Zoom con Scroll del Mouse**: Usa el scroll para acercar o alejar la imagen en el `canvas`.

## Personalización del Estilo

El estilo visual de la aplicación está definido en el archivo `style.css`, ubicado en `/src/styles/style.css`. Este archivo utiliza colores y tipografía inspirados en *Matrix* (1999), con tonos de verde neón sobre un fondo negro.

```css
/* Fragmento de estilo de ejemplo */
body, html {
    background-color: #000;
    color: #00ff41;
    font-family: 'Courier New', Courier, monospace;
}
```

Puedes modificar este archivo para ajustar los colores, tipografía o tamaño de los elementos según tus preferencias.

## Posibles Errores y Soluciones

1. **Error 404 al intentar cargar una imagen DICOM**
   - Asegúrate de que el servidor backend esté ejecutándose en el puerto 8000 y que el archivo DICOM esté en la carpeta `dicoms/`.

2. **Problemas con la instalación de dependencias**
   - Verifica que `pydicom`, `opencv-python` y `reportlab` estén instalados en el entorno virtual. Usa `pip install <package>` para instalar cualquier dependencia faltante.

3. **Problemas con CORS al conectar el frontend y el backend**
   - Si encuentras problemas relacionados con CORS, asegúrate de que el middleware de CORS en `main.py` esté configurado para permitir todas las solicitudes de origen cruzado.


### Integrantes 🐤:
- Ignacio González 👾 rol: 202104693-3
- Javiera Fuentes ⛄ rol: 202110518-2
- Cristian Pizarro 🐀 rol: 202104634-8
- Vicente Moya 🔰 rol: 201873601-5
