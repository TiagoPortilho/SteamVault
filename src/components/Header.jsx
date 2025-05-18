import React from "react";
import "../styles/Header.css";

function Header({ title }) {
  const searchbar = false;
  if (!title) {
    title = "SteamVault";
  }

  if (title === "Home") {
    return (
      <div className="header">
        <span className="page-title">{title}</span>

        <div class="searchbar">
            <input type="text" placeholder="Buscar..." />
            <svg
                class="search-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
            >
                <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707a1 1 0 001.414-1.414l-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
            </svg>
            </div>
        </div>
    );
  } else {
    return (
      <div className="header">
        <span className="page-title">{title}</span>
      </div>
    );
  }
}

export default Header;
