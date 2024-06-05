import React, { useState, useEffect } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import "./App.css";

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [showSubMenu, setShowSubMenu] = useState(false);

  useEffect(() => {
    if (imageSrc) {
      loadImage(imageSrc);
    }
  }, [imageSrc]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const byteArray = new Uint8Array(arrayBuffer);
      const dataSet = dicomParser.parseDicom(byteArray);
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser; // Provide dicomParser to cornerstoneWADOImageLoader
      cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
      cornerstoneWADOImageLoader.configure({
        beforeSend: function (xhr) {
          // Set any custom headers here
        },
      });
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      setImageSrc(imageId);
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const loadImage = (imageId) => {
    cornerstone.loadImage(imageId).then((image) => {
      const element = document.getElementById("dicomImage");
      cornerstone.enable(element);
      cornerstone.displayImage(element, image);
    }).catch((error) => {
      console.error("Error loading image:", error);
    });
  };

  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>DICOM image viewer</h1>
        <div className="buttons-container">
          <div className="left-buttons">
            <button onClick={toggleSubMenu}>Insertar Formas</button>
            {showSubMenu && (
              <div className="sub-menu">
                <button>Elipse</button>
                <button>Circulo</button>
                <button>Poligonos</button>
                <button>lineas</button>
                <button>Angulos</button>
              </div>
            )}
            <button>transversal</button>
            <button>Coronal</button>
            <button>Sagital</button>
          </div>
          <div className="right-button">
            <button className="red-button">Eliminar Forma</button>
          </div>
        </div>
      </header>
      <main>
        <div className="info-section">
          <input type="file" onChange={handleFileChange} />
          <p>Información sobre la imagen</p>
        </div>
        <div className="dicom-image" id="dicomImage"></div>
      </main>
    </div>
  );
}

export default App;

