import React from "react";
import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <div class="sidebar">
      <div class="app-title">SteamVault</div>

      <a href="#" class="menu-item">
        <i>
          <svg
            class="navicon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
          </svg>
        </i>
        <span class="navspan">Home</span>
      </a>

      <a href="#" class="menu-item">
        <i>
          <svg
            class="navicon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
          >
            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path>
          </svg>
        </i>
        <span class="navspan">Settings</span>
      </a>

      <div class="section-title">LIBRARY</div>

      <div class="search-box">
        <input type="text" placeholder="Buscar"></input>
      </div>

      <a href="#" class="library-item">
        <img
          src="https://user-images.githubusercontent.com/17349406/57204220-9cd11a00-6ff9-11e9-933d-8834cf75049a.jpg"
          alt="Game icon"
        ></img>
        <span>God of War</span>
      </a>
    </div>
  );
}

export default Sidebar;
