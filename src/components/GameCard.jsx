import React from "react";
import "../styles/GameCard.css";

function GameCard({ game }) {
  return (
    <div className="card">
      <img src={game.image} alt="Imagem do Jogo" />
      <div className="game-title">
        <h2>{game.title}</h2>
      </div>
      <div className="overlay">
        <h2>{game.title}</h2>
        <div className="info">
          <div className="info-item">
            <div className="info-label">Tempo Jogado</div>
            <div className="info-value">{game.playtime}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Status</div>
            <div className="info-value">{game.status}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Categoria</div>
            <div className="info-value">{game.category}</div>
          </div>
        </div>
        <a href="#" className="btn">Ver Detalhes</a>
      </div>
    </div>
  );
}

export default GameCard;
