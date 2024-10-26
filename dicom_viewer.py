import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const DicomViewer = ({ filenames }) => {
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [contrastLevel, setContrastLevel] = useState(null); // Estado para el nivel de contraste

  // Cargar la imagen cuando se cambie el índice o el nivel de contraste
  useEffect(() => {
    if (filenames.length > 0) {
      loadImage(filenames[currentImageIndex], contrastLevel);
    }
  }, [currentImageIndex, contrastLevel]);

  // Función para cargar la imagen desde el backend con el nivel de contraste seleccionado
  const loadImage = (filename, contrast) => {
    let url = `http://127.0.0.1:8000/image/${filename}`;
    if (contrast !== null) {
      url += `?umbral=${contrast}`;  // Pasar el valor del contraste como parámetro
    }
    
    axios.get(url, { responseType: 'blob' })
      .then(response => {
        const imageURL = URL.createObjectURL(response.data);
        setImageSrc(imageURL);
        console.log("Imagen cargada con contraste: ", contrast);
      })
      .catch(error => {
        console.error('Error al cargar la imagen:', error);
      });
  };

  // Renderizar la imagen en el canvas
  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        const windowWidth = window.innerWidth * 0.8;  // 80% del ancho de la ventana
        const windowHeight = window.innerHeight * 0.8;  // 80% de la altura de la ventana

        // Mantener las proporciones de la imagen
        const scale = Math.min(windowWidth / img.width, windowHeight / img.height) * zoom;
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;

        // Ajustar el tamaño del canvas al 80% del tamaño de la ventana
        canvas.width = windowWidth;
        canvas.height = windowHeight;

        // Dibujar la imagen centrada en el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, (canvas.width - imgWidth) / 2, (canvas.height - imgHeight) / 2, imgWidth, imgHeight);

        console.log("Imagen dibujada en el canvas");
      };
    }
  }, [imageSrc, zoom]);

  // Manejar el zoom con el scroll del mouse
  const handleZoom = (event) => {
    if (event.deltaY > 0) {
      setZoom(zoom * 1.1);  // Aumentar el zoom
    } else {
      setZoom(zoom * 0.9);  // Reducir el zoom
    }
  };

  // Manejar las teclas de flechas para cambiar de imagen
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        handleNextImage();  // Cambiar a la siguiente imagen con la flecha derecha
      } else if (event.key === "ArrowLeft") {
        handlePreviousImage();  // Cambiar a la imagen anterior con la flecha izquierda
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);  // Limpiar el event listener cuando el componente se desmonta
    };
  }, [currentImageIndex]);

  // Cambiar a la imagen siguiente
  const handleNextImage = () => {
    if (currentImageIndex < filenames.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  // Cambiar a la imagen anterior
  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Manejar el cambio de contraste
  const handleContrastChange = (level) => {
    setContrastLevel(level);  // Cambiar el nivel de contraste seleccionado
  };

  return (
    <div>
      <h1>Visor DICOM</h1>
      <canvas 
        ref={canvasRef} 
        style={{ border: '1px solid black', display: 'block', margin: '0 auto' }}
        onWheel={handleZoom}  // Manejar el zoom con el scroll del mouse
      ></canvas>
      <div>
        <button onClick={handlePreviousImage} disabled={currentImageIndex === 0}>Imagen Anterior</button>
        <button onClick={handleNextImage} disabled={currentImageIndex === filenames.length - 1}>Siguiente Imagen</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Contraste</h3>
        <button onClick={() => handleContrastChange(50)}>Contraste Bajo</button>
        <button onClick={() => handleContrastChange(128)}>Contraste Medio</button>
        <button onClick={() => handleContrastChange(200)}>Contraste Alto</button>
        <button onClick={() => handleContrastChange(null)}>Restaurar Contraste Original</button>
      </div>
    </div>
  );
};

export default DicomViewer;
