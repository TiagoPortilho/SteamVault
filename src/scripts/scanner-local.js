import fs from 'fs';
import path from 'path';
import { parse as vdfParse } from 'node-vdf';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Suporte para __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

 
const DEFAULT_STEAM_PATH = 'C:\\Program Files (x86)\\Steam';

function parseVDF(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return vdfParse(content);
}

function getSteamLibraries(steamPath = DEFAULT_STEAM_PATH) {
  const libraryFoldersPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
  if (!fs.existsSync(libraryFoldersPath)) return [path.join(steamPath, 'steamapps')];

  const data = parseVDF(libraryFoldersPath);

  const libraries = [];
  const libFolders = data.LibraryFolders || data.libraryfolders;

  for (const key in libFolders) {
    if (!isNaN(key)) {
      const entry = libFolders[key];
      const libraryPath = typeof entry === 'object' ? entry.path : entry;
      if (libraryPath) libraries.push(path.join(libraryPath, 'steamapps'));
    }
  }

  // Sempre incluir a pasta principal da Steam
  const mainSteamapps = path.join(steamPath, 'steamapps');
  if (!libraries.includes(mainSteamapps)) {
    libraries.push(mainSteamapps);
  }

  return libraries;
}

function getInstalledGames(libraries, steamPath = DEFAULT_STEAM_PATH) {
  const games = [];

  libraries.forEach(lib => {
    if (!fs.existsSync(lib)) return;

    const files = fs.readdirSync(lib);
    files.forEach(file => {
      if (file.startsWith('appmanifest') && file.endsWith('.acf')) {
        const manifestPath = path.join(lib, file);
        try {
          const manifest = parseVDF(manifestPath);
          const app = manifest.AppState;

          if (app) {
            games.push({
              appid: parseInt(app.appid),
              name: app.name,
              sizeOnDisk: app.SizeOnDisk
            });
          }
        } catch (err) {
          console.warn(`Erro ao processar ${file}:`, err.message);
        }
      }
    });
  });

  return games;
}

// Execução direta
const libraries = getSteamLibraries();
const games = getInstalledGames(libraries);
console.log('Installed Games:', games);

// Exportações
export { getSteamLibraries, getInstalledGames };
