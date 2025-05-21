import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Header from "../components/Header";
import "../styles/Settings.css";

function Settings() {
  const [steamPath, setSteamPath] = useState("C:\\Program Files (x86)\\Steam");
  const [mode, setMode] = useState("local");

  const [apiKey, setApiKey] = useState("");
  const [steamId, setSteamId] = useState("");

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
          <label>Mode</label>
          <div className="toggle">
            <div
              className={
                mode === "local" ? "toggle-option active" : "toggle-option"
              }
              onClick={() => setMode("local")}
            >
              Local
            </div>
            <div
              className={
                mode === "api" ? "toggle-option active" : "toggle-option"
              }
              onClick={() => setMode("api")}
            >
              API
            </div>
          </div>
        </div>

        {mode === "local" && (
          <div className="form-group">
            <label>Steam Directory</label>
            <div className="directory-input-group">
              <input type="text" value={steamPath} readOnly />
              <button className="browse-button" onClick={handleBrowseClick}>
                Search...
              </button>
            </div>
          </div>
        )}

        {mode === "api" && (
          <>
            <div className="form-group">
              <label>
                API Key{" "}
                <a
                  href="https://steamcommunity.com/dev/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="api-link"
                >
                  (Get your API key)
                </a>
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Steam API key"
              />
            </div>

            <div className="form-group">
              <label>SteamID64</label>
              <input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="Enter your SteamID64"
              />
            </div>
          </>
        )}

        <button className="save-button">Save</button>
      </div>
    </div>
  );
}

export default Settings;
