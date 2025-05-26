import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Header from "../components/Header";
import "../styles/Statistics.css";

function Statistics() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke("get_all_games")
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar jogos:", error);
        setLoading(false);
      });
  }, []);

  const totalGames = games.length;
  const finishedGames = games.filter((g) => g.finished === true).length;
  const fullyAchievedGames = games.filter(
    (g) => g.fully_achieved === true
  ).length;

  const totalPlaytimeHours =
    games.reduce((acc, game) => acc + game.playtime_minutes, 0) / 60;

  const topGames = [...games]
    .sort((a, b) => b.playtime_minutes - a.playtime_minutes)
    .slice(0, 5);

  return (
    <div>
      <Header title="Statistics" />
      <div className="stats-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Games</h3>
                <p>{totalGames}</p>
              </div>
              <div className="stat-card">
                <h3>Finished Games</h3>
                <p>{finishedGames}</p>
              </div>
              <div className="stat-card">
                <h3>100% Achievements</h3>
                <p>{fullyAchievedGames}</p>
              </div>
              <div className="stat-card">
                <h3>Total Playtime</h3>
                <p>{totalPlaytimeHours.toFixed(1)} hrs</p>
              </div>
            </div>

            <div className="top-games">
              <h2>Top 5 Most Played Games</h2>
              <div className="top-games-list">
                {topGames.map((game) => (
                  <div key={game.appid} className="top-game-card">
                    <div>
                      <h4>{game.name}</h4>
                      <p>{Math.round(game.playtime_minutes / 60)} hrs played</p>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            (game.playtime_minutes /
                              topGames[0].playtime_minutes) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Statistics;
