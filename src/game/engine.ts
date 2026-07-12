import { Input } from "./entities/input";
import { Cat } from "./entities/cat";
import { Obstacle, ObstacleType } from "./entities/obstacle";
import { Hud } from "./entities/hub";
export class Engine {

    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    private hud = new Hud();
    
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

    private score = 0;
    private nextSpawn = 1.5;

    private gameOver = false;

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

   update(delta: number) {

    if (this.gameOver)
        return;

    if (this.input.consumeJump())
        this.cat.jump();

    // ==========================
    // Verifica se existe um buraco sob o gato
    // ==========================

    // Atualiza física do gato
    this.cat.update(delta);

    // Atualiza obstáculos
    for (const obstacle of this.obstacles) {
        obstacle.update(delta, this.gameSpeed);
    }

    // Remove obstáculos fora da tela
    this.obstacles = this.obstacles.filter(
        obstacle => obstacle.x + obstacle.width > 0
    );

    // ==========================
    // Spawn
    // ==========================

    this.spawnTimer += delta;

    if (this.spawnTimer >= this.nextSpawn) {

        this.spawnTimer = 0;

        this.nextSpawn = Math.max(
            0.35,
            1.5 - this.gameSpeed / 3000
        );

        const types = [
            ObstacleType.Small,
            ObstacleType.Small,
            ObstacleType.Small,

            ObstacleType.Medium,
            ObstacleType.Medium,

            ObstacleType.Large,

            ObstacleType.Wall
        ];

        const randomType =
            types[Math.floor(Math.random() * types.length)];

        this.obstacles.push(
            new Obstacle(
                randomType,
                this.canvas.width + 100,
                this.groundY
            )
        );
    }

    // Movimento
    this.floorOffset += this.gameSpeed * delta;

    this.score += delta * 100;
    this.gameSpeed += delta * 10;

    // Morreu ao cair
    if (this.cat.y > this.canvas.height + 200) {

        this.gameOver = true;
        alert("Você caiu!");

        return;
    }

    // Morreu batendo
    if (this.checkCollision()) {

        this.gameOver = true;
        alert("Game Over! Sua pontuação: " + Math.floor(this.score));

    }

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

        // gato
        this.cat.render(this.ctx);

        //obstaculo
        for (const obstacle of this.obstacles) {
            obstacle.render(this.ctx);
        }

  const tile = 80;

let floorStart = 0;

this.drawFloor(
    floorStart,
    this.canvas.width
);
        // ===== HUD =====
        this.hud.render(
            this.ctx,
            this.canvas,
            this.score
        );

        this.ctx.restore();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.groundY = this.canvas.height - 140;

        if (this.cat) {
            this.cat.setGroundY(this.groundY);
        }
    }

    private checkCollision(): boolean {
        const cat = this.cat.getBounds();

        for (const obstacle of this.obstacles) {

            const bounds = obstacle.getBounds();

            if (!bounds)
                continue;

            if (
                cat.x < bounds.x + bounds.width &&
                cat.x + cat.width > bounds.x &&
                cat.y < bounds.y + bounds.height &&
                cat.y + cat.height > bounds.y
            ) {
                return true;
            }

        }

        return false;
    }

    private drawFloor(from: number, to: number) {

    const tile = 80;

    const start =
        from - ((this.floorOffset % tile + tile) % tile);

    this.ctx.strokeStyle = "#FF2ED6";
    this.ctx.lineWidth = 4;

    for (let x = start; x < to; x += tile) {

        if (x + tile < from)
            continue;

        this.ctx.strokeRect(
            x,
            this.groundY,
            tile,
            40
        );

    }

}

}