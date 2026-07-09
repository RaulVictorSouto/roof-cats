export class Obstacle {

    x: number;
    y: number;

    width: number;
    height: number;

    readonly type: ObstacleType;

    constructor(
        type: ObstacleType,
        x: number,
        groundY: number
    ) {

        this.type = type;
        this.x = x;

        switch (type) {

            // Fácil
            case ObstacleType.Small:
                this.width = 40;
                this.height = 50;
                break;

            // Médio
            case ObstacleType.Medium:
                this.width = 55;
                this.height = 90;
                break;

            // Exige um pulo mais alto
            case ObstacleType.Large:
                this.width = 70;
                this.height = 150;
                break;

            // Praticamente obriga double jump
            case ObstacleType.Wall:
                this.width = 90;
                this.height = 190;
                break;

            // Buraco
            case ObstacleType.Gap:
                this.width = 170;
                this.height = 0;
                break;
        }

        this.y = groundY - this.height;
    }

    update(delta: number, speed: number) {
        this.x -= speed * delta;
    }

    render(ctx: CanvasRenderingContext2D) {

        // Buraco não desenha nada
        if (this.type === ObstacleType.Gap)
            return;

        ctx.fillStyle = "#FF2ED6";

        ctx.shadowBlur = 18;
        ctx.shadowColor = "#FF2ED6";

        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        ctx.shadowBlur = 0;
    }

    getBounds() {

        if (this.type === ObstacleType.Gap)
            return null;

        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

}


export const ObstacleType = {
    Small: "small",
    Medium: "medium",
    Large: "large",
    Wall: "wall",
    Gap: "gap"
} as const;

export type ObstacleType =
    typeof ObstacleType[keyof typeof ObstacleType];