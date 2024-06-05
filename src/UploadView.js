import React, {useState} from 'react';

function UploadView() {
  const [file, setFile] = useState(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        localStorage.setItem("dicomFile", e.target.result);
        window.location.href()
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h1>Upload DICOM Image</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Upload and View</button>
    </div>
  );
}



export default UploadView;
