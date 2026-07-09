export class Hud {

    render(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        score: number
    ) {

        ctx.save();

        ctx.textAlign = "right";

        // Título
        ctx.font = '14px "Press Start 2P"';
        ctx.fillStyle = "#FF2ED6";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#FF2ED6";

        ctx.fillText(
            "SCORE",
            canvas.width - 30,
            25
        );

        // Valor
        ctx.font = "bold 28px \"Press Start 2P\"";
        ctx.fillStyle = "#1EEBFF";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#1EEBFF";

        ctx.fillText(
            Math.floor(score)
                .toString()
                .padStart(6, "0"),
            canvas.width - 30,
            60
        );

        ctx.restore();

    }

}