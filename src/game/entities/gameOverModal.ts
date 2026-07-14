export class GameOverModal {

    private visible = false;
    private score = 0;
    private ranking: any[] = [];

    private onRestart: () => void;
    private onExit: () => void;

    constructor(
        onRestart: () => void,
        onExit: () => void
    ) {
        this.onRestart = onRestart;
        this.onExit = onExit;

    }

    show(
        score: number,
        ranking: any[]
    ) {
        this.score = score;
        this.ranking = ranking;

        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    isVisible() {
        return this.visible;
    }

    render(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
    ) {
        if (!this.visible)
            return;
        /*Overlay*/
        ctx.fillStyle = "rgba(0,0,0,.75)";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const width =
            Math.min(
                canvas.width * .9,
                400
            );

        const height =
            Math.min(
                canvas.height * .75,
                500
            );

        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;

        /*  Card*/
        ctx.fillStyle = "#120326";
        ctx.fillRect(
            x,
            y,
            width,
            height
        );
        ctx.strokeStyle = "#FF2ED6";
        ctx.lineWidth = 4;
        ctx.strokeRect(
            x,
            y,
            width,
            height
        );
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        /*Titulo*/
        ctx.font = `${Math.min(canvas.width * .06, 24)}px 'Press Start 2P'`;
        ctx.fillStyle = "#FF3344";
        ctx.fillText(
            "GAME OVER",
            canvas.width / 2,
            y + 45
        );

        /* Score*/

        ctx.font = "14px 'Press Start 2P'";
        ctx.fillStyle = "#FFE600";
        ctx.fillText(
            "SCORE: " + Math.floor(this.score),
            canvas.width / 2,
            y + 90
        );

        /*
            Ranking
        */

        ctx.font = "11px 'Press Start 2P'";
        ctx.fillStyle = "#1EEBFF";
        ctx.fillText(
            "TOP PLAYERS",
            canvas.width / 2,
            y + 130
        );

        this.ranking
            .slice(0, 5)
            .forEach(
                (player, index) => {


                    ctx.fillStyle = "#FFF";


                    ctx.fillText(
                        `${index + 1}. ${player.username} ${player.score}`,
                        canvas.width / 2,
                        y + 170 + (index * 35)
                    );


                });


        /*
            Botão Restart
        */

        this.drawButton(
            ctx,
            canvas,
            x + 30,
            y + height - 100,
            width - 60,
            45,
            "RESTART",
            "#FFE600"
        );

        /*
            Botão sair
        */

        this.drawButton(
            ctx,
            canvas,
            x + 30,
            y + height - 45,
            width - 60,
            40,
            "EXIT",
            "#A0D7FF"
        );


    }

    private drawButton(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        w: number,
        h: number,
        text: string,
        color: string
    ) {
        ctx.fillStyle = "#24054A";
        ctx.fillRect(
            x,
            y,
            w,
            h
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x,
            y,
            w,
            h
        );
        ctx.fillStyle = color;
        ctx.font = "13px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText(
            text,
            x + w / 2,
            y + h / 2
        );

    }

    handleTouch(
        x: number,
        y: number,
        canvas: HTMLCanvasElement
    ) {
        if (!this.visible)
            return;

        const width =
            Math.min(
                canvas.width * .9,
                400
            );

        const height =
            Math.min(
                canvas.height * .75,
                500
            );

        const cardX =
            (canvas.width - width) / 2;

        const cardY =
            (canvas.height - height) / 2;

        // restart

        if (
            x > cardX + 30 &&
            x < cardX + width - 30 &&
            y > cardY + height - 100 &&
            y < cardY + height - 55
        ) {

            this.hide();

            this.onRestart();

        }

        // sair

        if (
            x > cardX + 30 &&
            x < cardX + width - 30 &&
            y > cardY + height - 45 &&
            y < cardY + height
        ) {

            this.hide();

            this.onExit();

        }

    }

}