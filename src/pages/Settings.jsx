import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Header from "../components/Header";
import "../styles/Settings.css";

function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [steamId, setSteamId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await invoke("carregar_configuracoes");
        if (config) {
          setApiKey(config.api_key);
          setSteamId(config.steam_id);
          console.log("Configurações carregadas:", config);
        }
      } catch (error) {
        console.log("Nenhuma configuração encontrada.");
      }
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setStatus("Salvando configurações e sincronizando jogos... Isso pode levar até 2 minutos.");
      setError(false);

      await invoke("salvar_configuracoes", {
        apiKey,
        steamId,
      });

      await invoke("sync_games_from_steam");

      setStatus("Configurações salvas e jogos sincronizados com sucesso!");
      setError(false);
    } catch (error) {
      console.error("Erro:", error);
      setStatus("Erro ao salvar ou sincronizar. Verifique sua API Key e SteamID.");
      setError(true);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 5000);
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

        <button className="save-button" onClick={handleSave} disabled={loading}>
          {loading ? "Salvando e Sincronizando..." : "Save and Sync"}
        </button>

        {status && (
          <p className={`status-message ${error ? "error" : ""}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

export default Settings;
