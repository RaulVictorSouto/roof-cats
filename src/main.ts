import "./style.css";
import { Engine } from "./game/engine";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

function resize(){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}

resize();

addEventListener("resize",resize);
const engine = new Engine(canvas);

window.addEventListener("resize", () => {
    engine.resize();
});

engine.start();