import "./style.css";
import { Engine } from "./game/engine";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const engine = new Engine(canvas);

engine.resize();

window.addEventListener("resize", () => {
    engine.resize();
});

engine.start();