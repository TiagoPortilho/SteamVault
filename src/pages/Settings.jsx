import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Header from "../components/Header";
import "../styles/Settings.css";

function Settings() {
  // Default state for the Steam directory path
  const [steamPath, setSteamPath] = useState("C:\\Program Files (x86)\\Steam");

  // Function to handle the "Browse" button click
  // This function will invoke the Tauri command to get the Steam directory
  const handleBrowseClick = async () => {
  try {
    const path = await invoke("ler_steam_dir");
    console.log("Diretório da Steam:", path);
    setSteamPath(path);
  } catch (error) {
    console.error("Erro ao invocar o comando:", error);
  }
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
