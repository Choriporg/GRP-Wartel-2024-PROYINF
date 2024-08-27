import React, { useState, useEffect, useCallback } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import { saveAs } from "file-saver";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import "./App.css";

function App() {
  const [imageIds, setImageIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [patientInfo, setPatientInfo] = useState({
    patientName: "información no disponible",
    patientID: "información no disponible",
    studyInstanceUID: "información no disponible",
    studyDescription: "información no disponible",
  });
  const [studyDate, setStudyDate] = useState("información no disponible");
  const [annotations, setAnnotations] = useState("");
  const [showSubMenu, setShowSubMenu] = useState(false);

  useEffect(() => {
    const initCornerstone = async () => {
      cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
      cornerstoneWADOImageLoader.configure({
        beforeSend: function (xhr) {
          // nya
        },
      });
    };

    initCornerstone();
  }, []);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    try {
      const imageIdsArray = await Promise.all(
        Array.from(files).map(async (file) => {
          const arrayBuffer = await readFileAsArrayBuffer(file);
          const byteArray = new Uint8Array(arrayBuffer);
          const dataSet = dicomParser.parseDicom(byteArray);
          const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
          extractImageInfo(imageId);
          return imageId;
        })
      );
      setImageIds(imageIdsArray);
      setCurrentIndex(0); // Mostrar la primera imagen después de cargar
    } catch (error) {
      console.error("Error cargando archivos:", error);
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

  const extractImageInfo = (imageId) => {
    const dataSet = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get(imageId);
    if (dataSet) {
      const patientName = dataSet.string("x00100010") || "información no disponible";
      const patientID = dataSet.string("x00100020") || "información no disponible";
      const studyInstanceUID = dataSet.string("x0020000d") || "información no disponible";
      const studyDate = dataSet.string("x00080020") || "información no disponible";
      const studyDescription = dataSet.string("x00081030") || "información no disponible";

      const info = {
        patientName,
        patientID,
        studyInstanceUID,
        studyDescription,
      };

      setPatientInfo(info);
      setStudyDate(studyDate);
    } else {
      setPatientInfo({
        patientName: "información no disponible",
        patientID: "información no disponible",
        studyInstanceUID: "información no disponible",
        studyDescription: "información no disponible",
      });
      setStudyDate("información no disponible");
    }
  };

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prevIndex) => prevIndex - 1);
      } else if (event.key === "ArrowRight" && currentIndex < imageIds.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    },
    [currentIndex, imageIds]
  );

  useEffect(() => {
    if (imageIds.length > 0) {
      loadImage(imageIds[currentIndex]);
    }
  }, [imageIds, currentIndex]);

  const loadImage = (imageId) => {
    cornerstone
      .loadAndCacheImage(imageId)
      .then((image) => {
        const element = document.getElementById("dicomImage");
        cornerstone.enable(element);
        cornerstone.displayImage(element, image);
      })
      .catch((error) => {
        console.error("Error cargando imagen:", error);
      });
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu);
  };

  const handleAnnotationChange = (e) => {
    setAnnotations(e.target.value);
  };

  const handleGeneratePDF = async () => {
    const styles = StyleSheet.create({
      page: {
        flexDirection: "column",
        backgroundColor: "#000",
        color: "#00ff00",
        fontFamily: "Courier",
        padding: 20,
      },
      section: {
        marginBottom: 10,
      },
      text: {
        fontSize: 12,
      },
    });

    const MyDocument = () => (
      <Document>
        <Page style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.text}>Paciente: {patientInfo.patientName} ({patientInfo.patientID})</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.text}>Descripción del estudio: {patientInfo.studyDescription}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.text}>Fecha del estudio: {studyDate}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.text}>Anotaciones: {annotations}</Text>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(<MyDocument />).toBlob();
    saveAs(blob, "informe.pdf");
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
                <button>Círculo</button>
                <button>Polígonos</button>
                <button>Líneas</button>
                <button>Ángulos</button>
              </div>
            )}
            <button>Transversal</button>
            <button>Coronal</button>
            <button>Sagital</button>
          </div>
          <div className="right-button">
            <button className="red-button" onClick={handleGeneratePDF}>
              Descargar PDF
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="info-section">
          <input type="file" onChange={handleFileChange} multiple />
          {patientInfo && (
            <div>
              <p>Información sobre la imagen</p>
              <p>Paciente: {patientInfo.patientName} ({patientInfo.patientID})</p>
              <p>Descripción del estudio: {patientInfo.studyDescription}</p>
              <p>Fecha del estudio: {studyDate}</p>
            </div>
          )}
        </div>
        <div className="dicom-image" id="dicomImage"></div>
        <div className="annotation-section">
          <h2>Anotaciones</h2>
          <textarea
            value={annotations}
            onChange={handleAnnotationChange}
            placeholder="Realiza tus anotaciones aquí..."
          ></textarea>
        </div>
      </main>
    </div>
  );
}

export default App;


