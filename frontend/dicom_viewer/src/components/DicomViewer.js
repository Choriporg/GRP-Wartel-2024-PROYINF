import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const DicomViewer = ({ filenames }) => {
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [contrast, setContrast] = useState(128);
  const [points, setPoints] = useState([]); // Puntos para calcular la distancia

  useEffect(() => {
    if (filenames.length > 0) {
      loadImage(filenames[currentImageIndex], contrast);
    }
  }, [currentImageIndex, contrast]);

  const loadImage = (filename, contrastValue) => {
    axios.get(`http://127.0.0.1:8000/image/${filename}`, {
      params: { umbral: contrastValue },
      responseType: 'blob',
    })
    .then(response => {
      const imageURL = URL.createObjectURL(response.data);
      setImageSrc(imageURL);
    })
    .catch(error => {
      console.error('Error al cargar la imagen:', error);
    });
  };

  const handleZoomIn = () => setZoom(zoom * 1.1);
  const handleZoomOut = () => setZoom(zoom * 0.9);

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPoints([...points, { x, y }]);

    if (points.length === 1) {
      const distance = calculateDistance(points[0], { x, y });
      alert(`Distancia: ${distance.toFixed(2)} px`);
      setPoints([]); // Reinicia los puntos después de mostrar la distancia
    }
  };

  const calculateDistance = (point1, point2) => {
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
  };

  const handleNextImage = () => {
    if (currentImageIndex < filenames.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div>
      <h1>Visor DICOM</h1>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', display: 'block', margin: '0 auto' }}
        onClick={handleCanvasClick}
      />
      <div>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handlePreviousImage} disabled={currentImageIndex === 0}>
          Imagen Anterior
        </button>
        <button onClick={handleNextImage} disabled={currentImageIndex === filenames.length - 1}>
          Siguiente Imagen
        </button>
      </div>
    </div>
  );
};

export default DicomViewer;



