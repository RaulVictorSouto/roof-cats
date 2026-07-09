export class Obstacle {

    x: number;
    y: number;

    width = 50;
    height = 70;

    constructor(x: number, groundY: number) {
        this.x = x;
        this.y = groundY - this.height;
    }

    update(delta: number, speed: number) {
        this.x -= speed * delta;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#FF2ED6";

        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FF2ED6";

        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        ctx.shadowBlur = 0;
    }

}