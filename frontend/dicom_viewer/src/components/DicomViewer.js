import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../styles/style.css';

const DicomViewer = ({ filenames }) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [anotaciones, setAnotaciones] = useState("");
  const [contrastLevel, setContrastLevel] = useState(null);
  const [zoom, setZoom] = useState(1.5);  // Escalado inicial
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const canvasRef = useRef(null);

  const currentFile = filenames[currentFileIndex];

  // Cargar la imagen DICOM desde el backend
  useEffect(() => {
    if (currentFile) {
      let url = `http://127.0.0.1:8000/image/${currentFile}`;
      if (contrastLevel !== null) {
        url += `?umbral=${contrastLevel}`;
      }
      axios.get(url, { responseType: 'blob' })
        .then(response => {
          const imgUrl = URL.createObjectURL(response.data);
          setImageSrc(imgUrl);
        })
        .catch(error => {
          console.error("Error al cargar la imagen:", error);
          alert("Error al cargar la imagen DICOM");
        });

      // Obtener dimensiones físicas del DICOM para el cálculo de distancia
      axios.get(`http://127.0.0.1:8000/dimensions/${currentFile}`)
        .then(response => {
          setDimensions(response.data);
        })
        .catch(error => {
          console.error("Error al obtener dimensiones del DICOM:", error);
        });
    }
  }, [currentFile, contrastLevel]);

  // Renderizar la imagen en el canvas con zoom
  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        const scale = 0.9 * zoom;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);

        // Dibujar la línea si se seleccionaron 2 puntos
        if (points.length === 2) {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(points[0].x * scale, points[0].y * scale);
          ctx.lineTo(points[1].x * scale, points[1].y * scale);
          ctx.stroke();
        }
      };
    }
  }, [imageSrc, zoom, points]);

  // Manejar clics en el canvas para seleccionar puntos
  const handleCanvasClick = (event) => {
    if (points.length < 2) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / zoom;
      const y = (event.clientY - rect.top) / zoom;
      setPoints([...points, { x, y }]);
    }
  };

  // Calcular la distancia entre dos puntos en mm
  useEffect(() => {
    if (points.length === 2 && dimensions) {
      const dx = (points[1].x - points[0].x) * dimensions.pixel_spacing[0];
      const dy = (points[1].y - points[0].y) * dimensions.pixel_spacing[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      setDistance(dist.toFixed(2));  // Redondea a 2 decimales
    }
  }, [points, dimensions]);

  // Borrar puntos y la línea
  const clearPoints = () => {
    setPoints([]);
    setDistance(null);
  };

  // Cambiar el contraste de la imagen
  const handleContrastChange = (level) => {
    setContrastLevel(level);
  };

  // Cambiar de imagen con las teclas de flechas
  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      setCurrentFileIndex((prevIndex) => (prevIndex + 1) % filenames.length);
    } else if (event.key === "ArrowLeft") {
      setCurrentFileIndex((prevIndex) => (prevIndex - 1 + filenames.length) % filenames.length);
    }
  };

  // Manejar el zoom con el scroll del mouse
  const handleZoom = (event) => {
    setZoom((prevZoom) => event.deltaY < 0 ? prevZoom * 1.1 : prevZoom * 0.9);
  };

  // Generar y descargar el PDF con anotaciones
  const handleDownloadPDF = () => {
    if (!currentFile) {
      alert("No hay archivo DICOM seleccionado");
      return;
    }
    axios.post('http://127.0.0.1:8000/download_pdf/', {
      filename: currentFile,
      anotaciones: anotaciones
    }, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${currentFile}_anotaciones.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error("Error al descargar el PDF:", error);
        alert("Error al descargar el PDF");
      });
  };

  // Añadir el evento de teclado para cambiar de imagen
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filenames]);

  return (
    <div style={{ display: 'flex', height: '90vh', width: '90vw', margin: 'auto' }}>
      {/* Lado izquierdo: Canvas, controles y distancia */}
      <div style={{ flex: 3, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1>Visor de Imágenes DICOM</h1>
        <canvas
          ref={canvasRef}
          style={{ border: '1px solid black', marginTop: '20px', maxWidth: '90%', maxHeight: '90%' }}
          onWheel={handleZoom} // Zoom con scroll del mouse
          onClick={handleCanvasClick}  // Selección de puntos
        />
        {distance && <p>Distancia entre puntos: {distance} mm</p>}
        <button onClick={clearPoints}>Borrar Puntos</button>

        {/* Botones de colormap */}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={() => handleContrastChange(50)}>Colormap Jet</button>
          <button onClick={() => handleContrastChange(128)}>Colormap Hot</button>
          <button onClick={() => handleContrastChange(200)}>Colormap Ocean</button>
          <button onClick={() => handleContrastChange(null)}>Original</button>
        </div>
      </div>

      {/* Lado derecho: Anotaciones y botón de descarga */}
      <div style={{ flex: 1, padding: '20px', borderLeft: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
        <h3>Anotaciones</h3>
        <textarea
          value={anotaciones}
          onChange={(e) => setAnotaciones(e.target.value)}
          rows={15}
          style={{ width: '100%', resize: 'none', marginBottom: '10px' }}
          placeholder="Escribe tus anotaciones aquí..."
        />
        <button onClick={handleDownloadPDF}>Descargar PDF</button>
      </div>
    </div>
  );
};

export default DicomViewer;











