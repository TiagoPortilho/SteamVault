import fetch from 'node-fetch';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
// ISSO É TESTE... NÃO TERA UM ARQUIVO .ENV E SIM O USUARIO VAI DEFINIR OS VALORES QUE VAI PARA UM SETTINGS
config();
const API_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID64;

if (!API_KEY || !STEAM_ID) {
  console.error('❌ Por favor, defina STEAM_API_KEY e STEAM_ID64 no arquivo .env');
  process.exit(1);
}


//Busca os jogos e informações do jogador
async function getOwnedGames(steamId, apiKey) {
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar jogos: ${res.status}`);

  const data = await res.json();

  if (!data.response || !data.response.games) return [];

  return data.response.games.map(game => ({
    appid: game.appid,
    name: game.name,
    playtime_minutes: game.playtime_forever || 0,
  }));
}

// Verifica se o jogo esta platinado
async function checkFullyAchieved(steamId, appid, apiKey) {
  const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamId}&appid=${appid}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return false;

    const data = await res.json();
    if (!data.playerstats || !data.playerstats.achievements) return false;

    const achievements = data.playerstats.achievements;

    if (achievements.length === 0) return false;

    return achievements.every(a => a.achieved === 1);
  } catch {
    return false;
  }
}

// Função que retorna lista dos jogos
async function getPlayerGameInfo(steamId, apiKey) {
  const games = await getOwnedGames(steamId, apiKey);

  for (const game of games) {
    game.fully_achieved = await checkFullyAchieved(steamId, game.appid, apiKey);
  }

  return games;
}


getPlayerGameInfo(STEAM_ID, API_KEY)
  .then(games => {
    console.log(JSON.stringify(games, null, 2));
  })
  .catch(console.error);
