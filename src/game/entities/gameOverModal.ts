import type { RankingEntry } from "../../service/ranking.service";

export class GameOverModal {

    private visible = false;
    private score = 0;

    private ranking: RankingPlayer[] = [];
    private rankingLoading = false;
    private rankingError = "";

    private onRestart: () => void;
    private onExit: () => void;

    constructor(
        onRestart: () => void,
        onExit: () => void
    ) {
        this.onRestart = onRestart;
        this.onExit = onExit;
    }

    /**
     * Mostra o modal imediatamente com o score final. O ranking normalmente
     * ainda não chegou nesse ponto (depende da resposta da API), então
     * já entra em estado de "carregando" até setRanking/setRankingError
     * serem chamados de fora (Engine).
     */
    show(score: number) {
        this.score = score;

        this.ranking = [];
        this.rankingError = "";
        this.rankingLoading = true;

        this.visible = true;
    }

    setRanking(ranking: RankingPlayer[]) {
        this.ranking = ranking;
        this.rankingLoading = false;
        this.rankingError = "";
    }

    setRankingError(message: string) {
        this.rankingLoading = false;
        this.rankingError = message;
    }

    hide() {
        this.visible = false;
    }

    isVisible() {
        return this.visible;
    }

    /**
     * Fonte única de verdade para o layout do card e dos botões.
     * Usado tanto pelo render() quanto pelo handleTouch(), evitando
     * qualquer dessincronia entre o que é desenhado e o que é clicável.
     */
    private getLayout(canvas: HTMLCanvasElement): Layout {

        const width = Math.min(canvas.width * .9, 400);
        const height = Math.min(canvas.height * .75, 500);

        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;

        const restartButton: ButtonRect = {
            x: x + 30,
            y: y + height - 100,
            width: width - 60,
            height: 45
        };

        const exitButton: ButtonRect = {
            x: x + 30,
            y: y + height - 45,
            width: width - 60,
            height: 40
        };

        return { x, y, width, height, restartButton, exitButton };
    }

    render(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
    ) {
        if (!this.visible)
            return;

        const { x, y, width, height, restartButton, exitButton } = this.getLayout(canvas);

        /* Overlay */
        ctx.fillStyle = "rgba(0,0,0,.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        /* Card */
        ctx.fillStyle = "#120326";
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = "#FF2ED6";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        /* Titulo */
        ctx.font = `${Math.min(canvas.width * .06, 24)}px 'Press Start 2P'`;
        ctx.fillStyle = "#FF3344";
        ctx.fillText("GAME OVER", canvas.width / 2, y + 45);

        /* Score */
        ctx.font = "14px 'Press Start 2P'";
        ctx.fillStyle = "#FFE600";
        ctx.fillText("SCORE: " + Math.floor(this.score), canvas.width / 2, y + 90);

        /* Ranking */
        ctx.font = "11px 'Press Start 2P'";
        ctx.fillStyle = "#1EEBFF";
        ctx.fillText("TOP PLAYERS", canvas.width / 2, y + 130);

        if (this.rankingLoading) {

            ctx.font = "11px 'Press Start 2P'";
            ctx.fillStyle = "#777";
            ctx.fillText("LOADING...", canvas.width / 2, y + 175);

        } else if (this.rankingError) {

            ctx.font = "10px 'Press Start 2P'";
            ctx.fillStyle = "#FF4D6D";
            ctx.fillText(this.rankingError, canvas.width / 2, y + 175);

        } else {

            this.ranking.slice(0, 5).forEach((player, index) => {

                ctx.font = "11px 'Press Start 2P'";
                ctx.fillStyle = "#FFF";
                ctx.fillText(
                    `${index + 1}. ${player.username} ${player.score}`,
                    canvas.width / 2,
                    y + 170 + index * 35
                );
            });
        }

        /* Botão Restart */
        this.drawButton(ctx, restartButton, "RESTART", "#FFE600");

        /* Botão Sair */
        this.drawButton(ctx, exitButton, "EXIT", "#A0D7FF");
    }

    private drawButton(
        ctx: CanvasRenderingContext2D,
        rect: ButtonRect,
        text: string,
        color: string
    ) {
        ctx.fillStyle = "#24054A";
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

        ctx.fillStyle = color;
        ctx.font = "13px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, rect.x + rect.width / 2, rect.y + rect.height / 2);
    }

    private isInside(x: number, y: number, rect: ButtonRect): boolean {
        return (
            x > rect.x &&
            x < rect.x + rect.width &&
            y > rect.y &&
            y < rect.y + rect.height
        );
    }

    handleTouch(
        x: number,
        y: number,
        canvas: HTMLCanvasElement
    ) {
        if (!this.visible)
            return;

        const { restartButton, exitButton } = this.getLayout(canvas);

        if (this.isInside(x, y, restartButton)) {
            this.hide();
            this.onRestart();
            return;
        }

        if (this.isInside(x, y, exitButton)) {
            this.hide();
            this.onExit();
            return;
        }
    }
}

interface Layout {
    x: number;
    y: number;
    width: number;
    height: number;
    restartButton: ButtonRect;
    exitButton: ButtonRect;
}

interface ButtonRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
