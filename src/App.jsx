import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar";
import GameCard from "./components/GameCard";
import "./App.css";

function App() {
  const witcher = {
    title: "The Witcher 3",
    image: "https://img.redbull.com/images/c_crop,w_1500,h_750,x_0,y_0/c_auto,w_1200,h_630/f_auto,q_auto/redbullcom/2016/06/09/1331799468257_1/games-the-witcher-3-wild-hunt",
    playtime: "120h",
    status: "Finalizado",
    category: "RPG",
  };
  const cyberpunk = {
    title: "Cyberpunk 2077",
    image: "https://store-images.s-microsoft.com/image/apps.34838.63407868131364914.bcaa868c-407e-42c2-baeb-48a3c9f29b54.1463028d-79fa-46e5-9fc2-63203992a4dc?q=90&w=480&h=270",
    playtime: "45h",
    status: "Jogando",
    category: "Ação/RPG",
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <GameCard game={witcher} />
          <GameCard game={cyberpunk} />
        </div>
      </div>
    </div>
  );
}

export default App;
