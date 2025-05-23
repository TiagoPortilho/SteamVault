import React, { useEffect, useState } from "react";
import GameCard from "./GameCard";
import "../styles/GameList.css";
import { invoke } from "@tauri-apps/api/tauri";

function GameList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        const games = await invoke("get_all_games"); 
        setGames(games);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  if (loading) return <p>Loading Games...</p>;
  if (error) return <p>Error while loading games: {error}</p>;
  if (games.length === 0) return <p>Please set you APIKEY and STEAMID in Settings.</p>;

  return (
    <div className="game-list">
      {games.map((game) => (
        <GameCard
          key={game.appid}
          game={{
            title: game.name,
            playtime: `${(game.playtimeMinutes / 60).toFixed(2)} Hours`,
            platina: game.fullyAchieved ? "Platined" : "Not Platined",
            image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
          }}
        />
      ))}
    </div>
  );
}

export default GameList;
