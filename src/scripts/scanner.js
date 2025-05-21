import fetch from "node-fetch";
import { invoke } from "@tauri-apps/api/tauri";

let API_KEY = "";
let STEAM_ID = "";

const loadConfig = async () => {
  try {
    const config = await invoke("carregar_configuracoes");
    if (config) {
      API_KEY = config.api_key;
      STEAM_ID = config.steam_id;
      console.log("Configurações carregadas:", config);
    }
  } catch (error) {
    console.log("Nenhuma configuração encontrada.");
  }
};

// Demora até carregar a config e só então chama getPlayerGameInfo
async function main() {
  await loadConfig();

  if (!API_KEY || !STEAM_ID) {
    console.error("API_KEY ou STEAM_ID não definidos");
    return;
  }

  try {
    const games = await getPlayerGameInfo(STEAM_ID, API_KEY);
    console.log(JSON.stringify(games, null, 2));
  } catch (error) {
    console.error(error);
  }
}

// Funções getOwnedGames, checkFullyAchieved e getPlayerGameInfo seguem iguais...

async function getOwnedGames(steamId, apiKey) {
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar jogos: ${res.status}`);

  const data = await res.json();

  if (!data.response || !data.response.games) return [];

  return data.response.games.map((game) => ({
    appid: game.appid,
    name: game.name,
    playtime_minutes: game.playtime_forever || 0,
  }));
}

async function checkFullyAchieved(steamId, appid, apiKey) {
  const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamId}&appid=${appid}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return false;

    const data = await res.json();
    if (!data.playerstats || !data.playerstats.achievements) return false;

    const achievements = data.playerstats.achievements;

    if (achievements.length === 0) return false;

    return achievements.every((a) => a.achieved === 1);
  } catch {
    return false;
  }
}

async function getPlayerGameInfo(steamId, apiKey) {
  const games = await getOwnedGames(steamId, apiKey);

  for (const game of games) {
    game.fully_achieved = await checkFullyAchieved(steamId, game.appid, apiKey);
  }

  return games;
}

// Rodar o fluxo
main();
