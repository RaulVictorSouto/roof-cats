export class Background {

    private stars = Array.from({ length: 120 }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.5
    }));

    private offset = 0;

    update(delta: number, speed: number) {
        // Parallax bem mais lento que o chão
        this.offset += speed * 0.15 * delta;
    }

    render(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
    ) {

        // Fundo
        ctx.fillStyle = "#0b0720";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Estrelas
        ctx.fillStyle = "#9cf5ff";

        for (const star of this.stars) {

            let x =
                star.x * canvas.width -
                (this.offset % canvas.width);

            if (x < 0)
                x += canvas.width;

            ctx.beginPath();

            ctx.arc(
                x,
                star.y * canvas.height,
                star.size,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}