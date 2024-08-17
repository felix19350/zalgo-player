import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ZalgoPlayer } from "../lib/components/ZalgoPlayer.tsx";
import { ZalgoMode } from "../lib/components/ZalgoTextGenerator.ts";
import style from "./zalgo-style.module.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="playerContainer">
      <ZalgoPlayer
        mediaUrl="https://upload.wikimedia.org/wikipedia/commons/9/91/Ride_of_the_Valkyries.ogg"
        refreshRateMs={3}
        fftSize={128}
        styles={style}
        mode={ZalgoMode.TOP}
      />
    </div>
  </StrictMode>
);
