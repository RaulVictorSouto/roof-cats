import type { Scene } from "./scene";

export class MenuScene implements Scene {

    private onSelect: (option: string) => void;

    private buttons = [
        {
            text: "SINGLE PLAYER",
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        {
            text: "MULTIPLAYER",
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
    ];

    constructor(onSelect: (option: string) => void) {

        this.onSelect = onSelect;

        window.addEventListener(
            "pointerdown",
            this.onPointerDown
        );

    }

    update(_: number) { }

    render(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
    ) {

        ctx.fillStyle = "#090114";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        // -----------------------------
        // LOGO
        // -----------------------------

        ctx.textAlign = "center";

        ctx.shadowBlur = 30;
        ctx.shadowColor = "#1EEBFF";

        ctx.fillStyle = "#1EEBFF";
        ctx.font = "42px 'Press Start 2P'";

        ctx.fillText(
            "ROOF CATS",
            canvas.width / 2,
            120
        );

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#9CCBFF";
        ctx.font = "14px 'Press Start 2P'";

        ctx.fillText(
            "Infinity Rooftop Runner",
            canvas.width / 2,
            165
        );

        // -----------------------------
        // BOTÕES
        // -----------------------------

        const width = Math.min(
            canvas.width * 0.82,
            360
        );

        const height = 70;

        const startY =
            canvas.height * 0.45;

        this.buttons.forEach((button, index) => {

            button.width = width;
            button.height = height;

            button.x =
                canvas.width / 2 - width / 2;

            button.y =
                startY + index * 110;

            ctx.shadowBlur = 18;
            ctx.shadowColor = "#FF2ED6";

            ctx.fillStyle = "#160329";

            ctx.fillRect(
                button.x,
                button.y,
                button.width,
                button.height
            );

            ctx.strokeStyle = "#FF2ED6";
            ctx.lineWidth = 3;

            ctx.strokeRect(
                button.x,
                button.y,
                button.width,
                button.height
            );

            ctx.shadowBlur = 0;

            ctx.fillStyle = "#FFFFFF";
            ctx.font = "18px 'Press Start 2P'";

            ctx.fillText(
                button.text,
                canvas.width / 2,
                button.y + 44
            );

        });

        // -----------------------------
        // RODAPÉ
        // -----------------------------

        ctx.fillStyle = "#666";

        ctx.font = "10px 'Press Start 2P'";

        ctx.fillText(
            "Tap to continue",
            canvas.width / 2,
            canvas.height - 40
        );

    }

    private onPointerDown = (event: PointerEvent) => {

        const x = event.clientX;
        const y = event.clientY;

        for (const button of this.buttons) {

            if (
                x >= button.x &&
                x <= button.x + button.width &&
                y >= button.y &&
                y <= button.y + button.height
            ) {

                this.onSelect(button.text);
                break;

            }

        }

    }

    onExit() {

        window.removeEventListener(
            "pointerdown",
            this.onPointerDown
        );

    }

}