import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import GameDetails from "./pages/GameDetails";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/details/:appid" element={<GameDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
