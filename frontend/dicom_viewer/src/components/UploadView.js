import React, { useState } from 'react';
import axios from 'axios';
import '../styles/style.css';

const UploadView = ({ onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
    setUploadError(null);
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
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(response => {
        console.log('Archivos subidos:', response.data.filenames);
        setUploadError(null);
        onUploadComplete(response.data.filenames);
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


