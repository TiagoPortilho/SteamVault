import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  return (
    <div>
      <Sidebar />
    </div>
  );
}

export default App;
