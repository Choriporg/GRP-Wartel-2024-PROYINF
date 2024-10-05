import React, { useState } from 'react';
import UploadView from './components/UploadView';
import DicomViewer from './components/DicomViewer';

function App() {
  const [filename, setFilename] = useState(null);

  const handleUploadComplete = (filename) => {
    setFilename(filename);
  };

  return (
    <div className="App">
      {!filename ? (
        <UploadView onUploadComplete={handleUploadComplete} />
      ) : (
        <DicomViewer filename={filename} />
      )}
    </div>
  );
}

export default App;
