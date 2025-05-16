import React from "react";
import "../styles/GameCard.css";

function GameCard({ game }) {
    return (
        <div class="card">
            <img src={game.image} alt="Imagem do Jogo"></img>
            <div class="game-title">
                <h2>game.title</h2>
            </div>
            <div class="overlay">
                <h2>game.title</h2>
                <div class="info">
                    <div class="info-item">
                        <div class="info-label">Tempo Jogado</div>
                        <div class="info-value">game.playtime</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value">game.status</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Categoria</div>
                        <div class="info-value">game.category</div>
                    </div>
                </div>
                <a href="#" class="btn">Ver Detalhes</a>
            </div>
        </div>
    );
}

export default GameCard;