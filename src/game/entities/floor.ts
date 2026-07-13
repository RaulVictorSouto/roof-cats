export class Floor {

    private offset = 0;

    private readonly tile = 80;
    private readonly roofHeight = 40;

    update(delta: number, speed: number) {
        this.offset += speed * delta;
    }

    render(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        groundY: number
    ) {

        const top = groundY;

        // ==========================
        // Linha principal
        // ==========================

        ctx.strokeStyle = "#FF2ED6";
        ctx.lineWidth = 4;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#FF2ED6";

        ctx.beginPath();
        ctx.moveTo(0, top);
        ctx.lineTo(canvas.width, top);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // ==========================
        // Telhas
        // ==========================

        const offset = this.offset % this.tile;

        for (
            let x = -offset;
            x < canvas.width + this.tile;
            x += this.tile
        ) {

            ctx.fillStyle = "#140325";

            ctx.fillRect(
                x + 2,
                top + 2,
                this.tile - 4,
                36
            );

            ctx.strokeStyle = "#8E156D";
            ctx.lineWidth = 1;

            ctx.strokeRect(
                x + 2,
                top + 2,
                this.tile - 4,
                36
            );

            ctx.strokeStyle = "#FF2ED6";

            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, top + 38);
            ctx.stroke();
        }

        this.drawBuildingWall(
            ctx,
            canvas,
            groundY
        );
    }

    private drawBuildingWall(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        groundY: number
    ) {

        const top = groundY + this.roofHeight;

        // Fundo

        ctx.fillStyle = "#0A0218";

        ctx.fillRect(
            0,
            top,
            canvas.width,
            canvas.height - top
        );

        // Colunas

        ctx.strokeStyle = "#31114D";
        ctx.lineWidth = 1;

        for (let x = 0; x < canvas.width; x += 50) {

            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();

        }

        // Linhas horizontais

        for (let y = top; y < canvas.height; y += 35) {

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();

        }

        // Linha neon

        ctx.shadowBlur = 18;
        ctx.shadowColor = "#FF2ED6";

        ctx.strokeStyle = "#FF2ED6";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, top);
        ctx.lineTo(canvas.width, top);
        ctx.stroke();

        ctx.shadowBlur = 0;
    }
}