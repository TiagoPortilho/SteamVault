import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import GameList from "../components/GameList.jsx";
import Header from "../components/Header";
import "../styles/Home.css";

function Home() {

  return (
    <div>
      <Header title="Home" />
      <div className="container">
        <GameList />
      </div>
    </div>
  );
}

export default Home;
