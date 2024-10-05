import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const DicomViewer = ({ filename }) => {
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    // Obtener la imagen procesada desde el backend
    axios.get(`http://127.0.0.1:8000/image/${filename}`, {
      responseType: 'blob',
    })
    .then(response => {
      const imageURL = URL.createObjectURL(response.data);
      setImageSrc(imageURL);
    })
    .catch(error => {
      console.error('Error al cargar la imagen:', error);
    });
  }, [filename]);

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        canvas.width = img.width * zoom;
        canvas.height = img.height * zoom;
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
      <canvas ref={canvasRef} style={{ border: '1px solid black' }}></canvas>
      <div>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
      </div>
    </div>
  );
};

export default DicomViewer;
