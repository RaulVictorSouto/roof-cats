import catSprite from "../../assets/cat-player.png";

export class Cat {

    x = 120;
    y = 0;

    width = 100;
    height = 70;

    velocityY = 0;

    gravity = 1700;
    jumpForce = -700;

    grounded = false;

    private groundY = 0;

    maxJumps = 2;
    jumpCount = 0;

    private sprite = new Image();

    // Cor do gato (útil para multiplayer)
    private color = "#FFFFFF";

    // Canvas temporário reutilizado
    private offscreen = document.createElement("canvas");
    private offCtx = this.offscreen.getContext("2d")!;

    // Ajuste caso o PNG tenha padding
    private crop = {
        x: 577,
        y: 337,
        width: 386,
        height: 278
    };

    constructor(groundY: number) {

        this.groundY = groundY;
        this.y = groundY - this.height;

        this.sprite.src = catSprite;

        this.sprite.onload = () => {
            this.offscreen.width = this.width;
            this.offscreen.height = this.height;

            this.offCtx.imageSmoothingEnabled = false;
        };

    }

    setColor(color: string) {
        this.color = color;
    }

    jump() {

        if (!this.grounded && this.jumpCount >= this.maxJumps)
            return;

        this.velocityY = this.jumpForce;
        this.grounded = false;
        this.jumpCount++;

    }

    update(delta: number) {

        this.velocityY += this.gravity * delta;
        this.y += this.velocityY * delta;

        if (this.y >= this.groundY - this.height) {

            this.y = this.groundY - this.height;

            this.velocityY = 0;
            this.grounded = true;

            this.jumpCount = 0;

        }

    }

    render(ctx: CanvasRenderingContext2D) {

        if (!this.sprite.complete)
            return;

        this.offCtx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        // Desenha o sprite cortando o padding
        this.offCtx.drawImage(
            this.sprite,

            this.crop.x,
            this.crop.y,
            this.crop.width,
            this.crop.height,

            0,
            0,
            this.width,
            this.height
        );

        // Pinta mantendo transparência
        this.offCtx.globalCompositeOperation = "source-in";
        this.offCtx.fillStyle = this.color;
        this.offCtx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

        this.offCtx.globalCompositeOperation = "source-over";

        ctx.save();

        ctx.imageSmoothingEnabled = false;

        ctx.shadowBlur = 18;
        ctx.shadowColor = this.color;

        ctx.drawImage(
            this.offscreen,
            this.x,
            this.y,
            this.width,
            this.height
        );

        ctx.restore();

    }

    setGroundY(groundY: number) {

        this.groundY = groundY;

        if (this.grounded)
            this.y = groundY - this.height;

    }

    getBounds() {

        return {

            x: this.x + 30,
            y: this.y + 30,

            width: this.width - 60,
            height: this.height - 45

        };

    }

}