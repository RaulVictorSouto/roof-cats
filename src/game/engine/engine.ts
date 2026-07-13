import { Input } from "../entities/input";
import { Cat } from "../entities/cat";
import { Obstacle, ObstacleType } from "../entities/obstacle";
import { Hud } from "../entities/hub";
import { Floor } from "../entities/floor";
import { Background } from "../entities/background";
import type { Scene } from "../scenes/scene";
import { MenuScene } from "../scenes/menu.scene";
import { LoginScene } from "../scenes/login.scene";
import { CreateAccountScene } from "../scenes/createAccount.scene";

export class Engine {

    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    private hud = new Hud();
    private floor = new Floor();
    private input!: Input;
    private cat!: Cat;
    private background = new Background();

    // Opcional: quando undefined, o loop principal roda o jogo em vez
    // de renderizar uma scene (login, criar conta, menu, etc).
    private currentScene?: Scene;

    private lastTime = 0;
    private groundY = 0;
    private gameSpeed = 350;

    private obstacles: Obstacle[] = [];
    private spawnTimer = 0;

    private score = 0;
    private nextSpawn = 1.5;

    private gameOver = false;
    private floorOffset = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.currentScene = new MenuScene(
            (option) => {
                switch (option) {

                    case "SINGLE PLAYER":
                        this.setScene(this.buildLoginScene());
                        break;

                    case "MULTIPLAYER":
                        alert("Em breve!");
                        break;

                }
            }
        );

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

        // Sem isso, nenhuma scene (menu, login, criar conta) recebe toque/clique:
        // ela só desenha os botões/links no canvas, mas nada escutava o clique
        // e repassava pra scene.handleTouch(). Esse listener resolve isso.
        this.canvas.addEventListener("pointerdown", (e) => this.handleCanvasPointer(e));
    }

    /**
     * Converte a coordenada do toque/clique (em pixels CSS, relativos à
     * página) para a coordenada interna do canvas (canvas.width/height),
     * já que em telas de alta densidade (retina/mobile) esses valores
     * costumam ser diferentes. Sem essa conversão, o hit-test dentro de
     * handleTouch() fica errado em boa parte dos dispositivos.
     */
    private handleCanvasPointer(e: PointerEvent) {

        if (!this.currentScene)
            return;

        // Scene may not implement handleTouch; check at runtime
        const handler = (this.currentScene as any).handleTouch;
        if (typeof handler !== "function")
            return;

        const rect = this.canvas.getBoundingClientRect();

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        handler.call(this.currentScene, x, y);
    }

    start() {
        requestAnimationFrame(this.loop);
    }

    private loop = (time: number) => {
        const delta = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.update(delta);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);
        this.render();
        requestAnimationFrame(this.loop);
    }

    update(delta: number) {
        if (this.currentScene) {
            this.currentScene.update(delta);
            return;
        }

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

        this.floor.update(delta, this.gameSpeed);
        this.background.update(delta, this.gameSpeed);

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
        if (this.currentScene) {
            this.currentScene.render(
                this.ctx,
                this.canvas
            );
            return;

        }

        this.ctx.fillStyle = "#0b0720";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.background.render(this.ctx, this.canvas);

        // gato
        this.cat.render(this.ctx);

        //obstaculo
        for (const obstacle of this.obstacles) {
            obstacle.render(this.ctx);
        }

        this.floor.render(
            this.ctx,
            this.canvas,
            this.groundY
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

    /**
     * Monta a LoginScene já com os callbacks ligados:
     * - login bem sucedido -> fecha a scene e começa o jogo
     * - "criar conta"      -> troca pra CreateAccountScene
     */
    private buildLoginScene(): LoginScene {
        return new LoginScene(
            (user, password) => {
                // TODO: validar credenciais (API/local) antes de iniciar o jogo
                this.startGame();
            },
            () => {
                this.setScene(this.buildCreateAccountScene());
            }
        );
    }

    /**
     * Monta a CreateAccountScene já com os callbacks ligados:
     * - conta criada  -> fecha a scene e começa o jogo (ou loga automaticamente)
     * - "voltar"      -> volta pra LoginScene
     */
    private buildCreateAccountScene(): CreateAccountScene {
        return new CreateAccountScene(
            (user, email, password) => {
                // TODO: persistir a conta (API/local) antes de iniciar o jogo
                this.startGame();
            },
            () => {
                this.setScene(this.buildLoginScene());
            }
        );
    }

    /**
     * Fecha qualquer scene de UI ativa e retoma o loop do jogo.
     */
    private startGame() {
        this.setScene(undefined);
    }

    setScene(scene: Scene | undefined) {
        this.currentScene?.onExit?.();
        this.currentScene = scene;
        this.currentScene?.onEnter?.();
    }

}