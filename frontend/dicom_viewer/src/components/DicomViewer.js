import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const DicomViewer = ({ filename }) => {
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [contrast, setContrast] = useState(128); // Estado para el valor del contraste

  // Función para cargar la imagen desde el backend con el contraste ajustado
  const loadImage = (contrastValue) => {
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

  // Cargar la imagen cuando el contraste cambie
  useEffect(() => {
    if (filename) {
      loadImage(contrast);  // Cargar la imagen con el valor inicial de contraste
    }
  }, [filename, contrast]);

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        // Ajustar el tamaño del canvas al tamaño original de la imagen
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        canvas.width = imgWidth * zoom;
        canvas.height = imgHeight * zoom;

        // Limpiar el canvas y dibujar la imagen completa manteniendo proporciones
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [imageSrc, zoom]);

  const handleZoomIn = () => {
    setZoom(zoom * 1.1);  // Incrementar el zoom
  };

  const handleZoomOut = () => {
    setZoom(zoom * 0.9);  // Disminuir el zoom
  };

  // Función para incrementar el contraste
  const increaseContrast = () => {
    setContrast((prevContrast) => Math.min(prevContrast + 10, 255));
  };

  // Función para disminuir el contraste
  const decreaseContrast = () => {
    setContrast((prevContrast) => Math.max(prevContrast - 10, 0));
  };

  const handleScroll = (event) => {
    if (event.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div onWheel={handleScroll}>
      <h1>Visor DICOM</h1>
      <canvas ref={canvasRef} style={{ border: '1px solid black', display: 'block', margin: '0 auto' }}></canvas>
      <div>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
      </div>
      <div>
        <button onClick={increaseContrast}>Incrementar Contraste</button>
        <button onClick={decreaseContrast}>Disminuir Contraste</button>
      </div>
    </div>
  );
};

export default DicomViewer;


