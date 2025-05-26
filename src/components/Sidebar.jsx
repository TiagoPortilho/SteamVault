import React, { useEffect, useState } from "react";
import "../styles/Sidebar.css";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";

function Sidebar() {
  const [games, setGames] = useState([]);

  const loadGames = async () => {
    try {
      const games = await invoke("side_games");
      setGames(games);
    } catch (err) {
      console.log(err.toString());
    } finally {
      console.log("Games loaded");
    }
  };

  const handleSearchChange = async (e) => {
    const search = e.target.value.trim();

    if (search === "") {
      loadGames();
      return;
    }

    try {
      const filteredGames = await invoke("search_games_by_name", { search });
      setGames(filteredGames);
    } catch (err) {
      console.log(err.toString());
      setGames([]);
    } finally {
      console.log("Search completed");
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  return (
    <div className="sidebar">
      <div className="app-title">SteamVault</div>

      <Link to="/" className="menu-item">
        <i>
          <svg
            className="navicon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
          </svg>
        </i>
        <span className="navspan">Home</span>
      </Link>

      <Link to="/settings" className="menu-item">
        <i>
          <svg
            className="navicon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
          >
            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path>
          </svg>
        </i>
        <span className="navspan">Settings</span>
      </Link>

      <div className="section-title">LIBRARY</div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar"
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="library-list">
        {games.map((game) => (
          <Link to={`/details/${game.appid}`} className="library-item">
            <span>{game.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
