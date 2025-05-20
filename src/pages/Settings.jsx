import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Header from "../components/Header";
import "../styles/Settings.css";

function Settings() {
  const [steamPath, setSteamPath] = useState("C:\\Program Files (x86)\\Steam");

  const handleBrowseClick = () => {
    // Futuramente usar o Tauri dialog.open() pra escolher a pasta
    console.log("Botão de procurar clicado!");
  };

  return (
    <div>
      <Header title="Settings" />
      <div className="config-container">
        <h2>Settings</h2>

        <div className="form-group">
          <label>Language</label>
          <select>
            <option value="en-US">English (US)</option>
            <option value="pt-BR">Português (Brasil)</option>
            <option value="es-ES">Español</option>
          </select>
        </div>

        <div className="form-group">
          <label>Steam Directory</label>
          <div className="directory-input-group">
            <input type="text" value={steamPath} readOnly />
            <button className="browse-button" onClick={handleBrowseClick}>
              Search...
            </button>
          </div>
        </div>

        <button className="save-button">Save</button>
      </div>
    </div>
  );
}

export default Settings;
