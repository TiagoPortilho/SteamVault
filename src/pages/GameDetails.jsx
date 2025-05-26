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
        const result = await invoke('get_game_details', { appid: Number(appid) });
        setGame(result);
      } catch (error) {
        console.error('Erro carregando detalhes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [appid]);

  if (loading) return <p>Carregando...</p>;
  if (!game) return <p>Jogo não encontrado</p>;
  
  return (
    <div>
    <Header title={game.name} />   
      <h1>{game.name}</h1>
      <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`} alt={game.name} />
      <p>Tempo jogado: {game.playtime_minutes} minutos</p>
      <p>Conquistas: {game.trophies || 'Nenhuma'}</p>
      <p>Finalizado: {game.finished ? 'Sim' : 'Não'}</p>
      <p>Platinado: {game.fully_achieved ? 'Sim' : 'Não'}</p>

    </div>
  );
};

export default GameDetails;