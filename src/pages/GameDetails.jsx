import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";
import Header from "../components/Header";
import "../styles/GameDetails.css";

const GameDetails = () => {
  const { appid } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const result = await invoke("get_game_details", {
          appid: Number(appid),
        });
        setGame(result);
      } catch (error) {
        console.error("Erro carregando detalhes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [appid]);

  const handleToggleFinished = async () => {
    try {
      if (game.finished) {
        await invoke("unmark_game_as_finished", { appid: Number(appid) });
        setGame((prev) => ({ ...prev, finished: false }));
      } else {
        await invoke("mark_game_as_finished", { appid: Number(appid) });
        setGame((prev) => ({ ...prev, finished: true }));
      }
    } catch (error) {
      console.error("Erro ao alterar finalização:", error);
    }
  };

  const AchievementProgress = (progressStr) => {
    if (!progressStr) return 0;
    const [achieved, total] = progressStr.split("/").map(Number);
    if (!total || total === 0) return 0;
    return Math.round((achieved / total) * 100);
  };

  if (loading)
    return (
      <div className="game-details-container">
        <p>Loading...</p>
      </div>
    );

  if (!game)
    return (
      <div className="game-details-container">
        <p>Game not found</p>
      </div>
    );

  const playtimeHours = (game.playtime_minutes / 60).toFixed(1);

  const CheckIcon = () => (
    <svg
      width="20"
      height="20"
      fill="#4CAF50"
      viewBox="0 0 24 24"
      style={{ verticalAlign: "middle" }}
    >
      <path d="M20.285 6.709a1 1 0 00-1.414-1.418l-9.17 9.178-4.583-4.59a1 1 0 10-1.415 1.416l5.29 5.298a1 1 0 001.415 0l9.877-9.884z" />
    </svg>
  );

  const CrossIcon = () => (
    <svg
      width="20"
      height="20"
      fill="#F44336"
      viewBox="0 0 24 24"
      style={{ verticalAlign: "middle" }}
    >
      <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12l-4.88 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.88a1 1 0 001.41-1.41L13.41 12l4.88-4.89a1 1 0 000-1.4z" />
    </svg>
  );

  const TrophyIcon = () => (
    <svg
      width="20"
      height="20"
      fill="#2196F3"
      viewBox="0 0 24 24"
      style={{ verticalAlign: "middle" }}
    >
      <path d="M17 4V2H7v2H2v3a5 5 0 005 5h.17A5.998 5.998 0 0011 17.9V20H8v2h8v-2h-3v-2.1A5.998 5.998 0 0016.83 12H17a5 5 0 005-5V4h-5zm-10 6a3 3 0 01-3-3V6h3v4zm14-3a3 3 0 01-3 3V6h3v1z" />
    </svg>
  );

  return (
    <div>
      <Header title={game.name} />
      <div className="game-details-container">
        <div className="game-header">
          <img
            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
            alt={game.name}
            className="game-cover"
          />
          <div className="game-info">
            <h1>{game.name}</h1>

            <div className="stats-grid">
              <div className="stat">
                <span className="label">Time Played</span>
                <span className="value">{playtimeHours}h</span>
              </div>
              <div className="stat">
                <span className="label">Achievements</span>
                <span className="value">
                  {game.trophies ? `${game.trophies}` : "Nenhuma"}
                </span>
              </div>
              <div className="stat">
                <span className="label">Finished</span>
                <span className="value icon-value">
                  {game.finished ? <CheckIcon /> : <CrossIcon />}
                </span>
              </div>
              <div className="stat">
                <span className="label">Platined</span>
                <span className="value icon-value">
                  {game.fully_achieved ? <TrophyIcon /> : <CrossIcon />}
                </span>
              </div>
            </div>

            <div className="progress-container">
              <span>Achievements progress</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${AchievementProgress(game.trophies)}%` }}
                />
              </div>
              <span className="progress-text">
                {AchievementProgress(game.trophies)}%
              </span>
            </div>

            <button className="finish-button" onClick={handleToggleFinished}>
              {game.finished ? "Unmark as Finished" : "Mark as Finished"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
