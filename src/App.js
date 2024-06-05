// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UploadView from "./UploadView";
import DisplayView from "./DisplayView";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/display" element={<DisplayView />} />
          <Route path="/" element={<UploadView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;