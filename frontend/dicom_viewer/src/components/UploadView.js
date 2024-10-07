import React, { useState } from 'react';
import axios from 'axios';

const UploadView = ({ onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files); // Guardar los archivos seleccionados
    setUploadError(null); // Limpiar cualquier mensaje de error previo al seleccionar nuevos archivos
  };

  const handleFileUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Por favor selecciona al menos un archivo DICOM');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    axios.post('http://127.0.0.1:8000/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log('Respuesta completa del servidor:', response); // Depuración completa
        if (response.data && response.data.filenames) {
          setUploadError(null); // Limpiar el mensaje de error si la carga es exitosa
          onUploadComplete(response.data.filenames);  // Cambiar a la vista del visor
        } else {
          console.error('La respuesta no contiene los nombres de los archivos esperados.');
          setUploadError('Error al procesar la respuesta del servidor.');
        }
      })
      .catch(error => {
        console.error('Error al subir los archivos:', error);
        setUploadError('Error al subir los archivos');
      });
  };

  return (
    <div>
      <h1>Cargar Imágenes DICOM</h1>
      <input type="file" onChange={handleFileChange} accept=".dcm" multiple />
      <button onClick={handleFileUpload}>Subir Imágenes</button>
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
    </div>
  );
};

export default UploadView;

