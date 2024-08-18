import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ZalgoPlayer } from "../lib/components/ZalgoPlayer.tsx";
import { ZalgoMode } from "../lib/components/ZalgoTextGenerator.ts";
import styleTop from "./zalgo-style-top.module.css";
import styleBoth from "./zalgo-style-both.module.css";
import styleMirror from "./zalgo-style-bottom.module.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="playerContainer">
      <h1>Render mode: TOP</h1>
      <ZalgoPlayer
        mediaUrl="https://upload.wikimedia.org/wikipedia/commons/9/91/Ride_of_the_Valkyries.ogg"
        refreshRateMs={3}
        numColumns={64}
        maxCharacterPerCol={32}
        styles={styleTop}
        mode={ZalgoMode.TOP}
      />
    </div>

    <hr />
    <div className="playerContainer">
      <h1>Render mode: BOTH</h1>
      <ZalgoPlayer
        mediaUrl="https://upload.wikimedia.org/wikipedia/commons/9/91/Ride_of_the_Valkyries.ogg"
        refreshRateMs={3}
        numColumns={64}
        maxCharacterPerCol={32}
        styles={styleBoth}
        mode={ZalgoMode.BOTH}
      />
    </div>
    <hr />
    <div className="playerContainer">
      <h1>Render mode: BOTTOM</h1>
      <ZalgoPlayer
        mediaUrl="https://upload.wikimedia.org/wikipedia/commons/9/91/Ride_of_the_Valkyries.ogg"
        refreshRateMs={3}
        numColumns={64}
        maxCharacterPerCol={32}
        styles={styleMirror}
        mode={ZalgoMode.BOTTOM}
      />
    </div>
  </StrictMode>
);
