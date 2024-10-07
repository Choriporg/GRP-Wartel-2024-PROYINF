import React, { useState } from 'react';
import UploadView from './components/UploadView';
import DicomViewer from './components/DicomViewer';

function App() {
  const [filenames, setFilenames] = useState([]);

  const handleUploadComplete = (uploadedFilenames) => {
    setFilenames(uploadedFilenames); // Actualiza la lista de nombres de archivos
  };

  return (
    <div className="App">
      {filenames.length === 0 ? (
        <UploadView onUploadComplete={handleUploadComplete} />
      ) : (
        <DicomViewer filenames={filenames} />
      )}
    </div>
  );
}

export default App;

