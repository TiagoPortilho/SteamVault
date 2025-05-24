import React from "react";
import "../styles/GameCard.css";
import { Link } from "react-router-dom";

function GameCard({ game }) {
  return (
    <div className="card">
      <img src={game.image} alt="Game Image" />
      <div className="game-title">
        <h2>{game.title}</h2>
      </div>
      <div className="overlay">
        <h2>{game.title}</h2>
        <div className="info">
          <div className="info-item">
            <div className="info-label">Time Played</div>
            <div className="info-value">{game.playtime}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Trophies</div>
            <div className="info-value">{game.platina}</div>
          </div>
        </div>
        <Link to="/details" className="btn">
          <span>Details</span>
        </Link>
      </div>
    </div>
  );
}

export default GameCard;
