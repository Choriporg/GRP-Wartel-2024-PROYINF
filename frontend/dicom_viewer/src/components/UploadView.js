import React, { useState } from 'react';
import axios from 'axios';

const UploadView = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo DICOM');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    axios.post('http://127.0.0.1:8000/upload/', formData)
      .then(response => {
        onUploadComplete(response.data.filename);  // Cambiar a la vista del visor
      })
      .catch(error => {
        console.error('Error al subir el archivo', error);
        setUploadError('Error al subir el archivo');
      });
  };

  return (
    <div>
      <h1>Cargar Imagen DICOM</h1>
      <input type="file" onChange={handleFileChange} accept=".dcm" />
      <button onClick={handleFileUpload}>Subir Imagen</button>
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
    </div>
  );
};

export default UploadView;
