import { Input } from "./entities/input";
import { Cat } from "./entities/cat";
import { Obstacle } from "./entities/Obstacle";
export class Engine {

    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    
    private lastTime = 0;
    private stars = Array.from({length:120},()=>({
        x:Math.random(),
        y:Math.random(),
        size:Math.random()*2
    }));
    private groundY = 0;
    private input!: Input;
    private cat!: Cat;
    private gameSpeed = 350;

    private obstacles: Obstacle[] = [];
    private spawnTimer = 0;

    private floorOffset = 0;

   constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Canvas não suportado");

        this.ctx = ctx;

        // Apenas calcula o tamanho da tela
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.groundY = this.canvas.height - 140;

        this.input = new Input();
        this.cat = new Cat(this.groundY);

        window.addEventListener("resize", () => this.resize());
    }

    start(){
        requestAnimationFrame(this.loop);
    }

    private loop = (time:number)=>{
        const delta = (time - this.lastTime)/1000;
        this.lastTime = time;
        this.update(delta);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);
        this.render();
        requestAnimationFrame(this.loop);
    }

    update(delta:number){
        if(this.input.consumeJump())
            this.cat.jump();

        this.cat.update(delta);

        for (const obstacle of this.obstacles) {
            obstacle.update(delta, this.gameSpeed);
        }

        this.spawnTimer += delta;
        if (this.spawnTimer > 1.5) {
            this.spawnTimer = 0;
            this.obstacles.push(
                new Obstacle(
                    this.canvas.width + 100,
                    this.groundY
                )
            );
        }

        this.floorOffset += this.gameSpeed * delta;
    }

    render() {
        this.ctx.fillStyle = "#0b0720";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const star of this.stars) {
            this.ctx.fillStyle = "#9cf5ff";
            this.ctx.beginPath();
            this.ctx.arc(
                star.x * this.canvas.width,
                star.y * this.canvas.height,
                star.size,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            const x = (star.x * this.canvas.width - this.floorOffset * 0.15) % this.canvas.width;
        }

        // chão
        this.ctx.strokeStyle = "#FF2ED6";
        this.ctx.lineWidth = 4;

        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();

        // gato
        this.cat.render(this.ctx);

        //obstaculo
        for (const obstacle of this.obstacles) {
            obstacle.render(this.ctx);
        }

        const tile = 80;
        for (let x = -(this.floorOffset % tile); x < this.canvas.width; x += tile) {
            this.ctx.strokeStyle = "#FF2ED6";
            this.ctx.strokeRect(
                x,
                this.groundY,
                tile,
                40
            );
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.groundY = this.canvas.height - 140;

        if (this.cat) {
            this.cat.setGroundY(this.groundY);
        }
    }

}