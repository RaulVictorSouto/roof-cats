import type { Scene } from "./scene";

export class CreateAccountScene implements Scene {

    private fields: FieldConfig[] = [
        { label: "USERNAME", value: "", max: 16, type: "text" },
        { label: "EMAIL", value: "", max: 32, type: "email" },
        { label: "PASSWORD", value: "", max: 20, secure: true, type: "password" },
        { label: "CONFIRM PASSWORD", value: "", max: 20, secure: true, type: "password" }
    ];

    private selected = 0;

    private errorMessage = "";

    private onCreateAccount: (user: string, email: string, password: string) => void;
    private onBackToLogin: () => void;

    private cursorVisible = true;
    private cursorTimer = 0;

    private inputs: HTMLInputElement[] = [];

    private canvas!: HTMLCanvasElement;

    private resizeHandler = () => this.positionInputs();

    constructor(
        onCreateAccount: (user: string, email: string, password: string) => void,
        onBackToLogin: () => void
    ) {
        this.onCreateAccount = onCreateAccount;
        this.onBackToLogin = onBackToLogin;
    }

    onEnter() {
        this.createInputs();
        document.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("resize", this.resizeHandler);
        window.addEventListener("orientationchange", this.resizeHandler);
    }

    onExit() {
        this.removeInputs();
        document.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("resize", this.resizeHandler);
        window.removeEventListener("orientationchange", this.resizeHandler);
    }

    update(delta: number) {
        this.cursorTimer += delta;

        if (this.cursorTimer > .5) {
            this.cursorVisible = !this.cursorVisible;
            this.cursorTimer = 0;
        }
    }

    /**
     * Fonte única de verdade para o layout do card e dos campos.
     * O card cresce automaticamente conforme fields.length, então
     * dá pra adicionar/remover campo sem recalcular nada na mão.
     * Usado pelo render(), pelo posicionamento dos <input> reais
     * e pelo handleTouch (para os botões), evitando qualquer
     * dessincronia entre o que é desenhado e o que é clicável.
     */
    private getLayout(canvas: HTMLCanvasElement) {

        const margin = 20;
        const n = this.fields.length;

        const cardWidth = Math.min(canvas.width - margin * 2, 430);

        // mesma progressão usada no LoginScene:
        // último campo termina em 90n + 60, botão fica 60px abaixo,
        // link 50px abaixo do botão, e o card termina 70px depois do link
        const lastFieldBottom = 90 * n + 60;
        const buttonOffset = lastFieldBottom + 60;
        const linkOffset = buttonOffset + 50;
        const cardHeight = linkOffset + 70;

        const x = (canvas.width - cardWidth) / 2;
        const y = (canvas.height - cardHeight) / 2;

        const inputX = x + 25;
        const inputWidth = cardWidth - 50;
        const inputHeight = 60;

        const fieldRects: Rect[] = this.fields.map((_, index) => ({
            x: inputX,
            y: y + 90 + index * 90,
            width: inputWidth,
            height: inputHeight
        }));

        return {
            x, y, cardWidth, cardHeight,
            fieldRects,
            buttonY: y + buttonOffset,
            linkY: y + linkOffset
        };
    }

    render(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
    ) {

        this.canvas = canvas;

        const { x, y, cardWidth, cardHeight, fieldRects, buttonY, linkY } = this.getLayout(canvas);

        ctx.fillStyle = "#07000F";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        /* CARD */
        ctx.fillStyle = "#120326";
        ctx.fillRect(x, y, cardWidth, cardHeight);

        ctx.strokeStyle = "#FF2ED6";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, cardWidth, cardHeight);

        /* TITLE */
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${Math.min(canvas.width * .06, 24)}px 'Press Start 2P'`;
        ctx.fillStyle = "#1EEBFF";
        ctx.fillText("CREATE ACCOUNT", canvas.width / 2, y + 45);

        /* INPUTS (desenho visual, o input real fica invisível por cima) */
        this.fields.forEach((field, index) => {

            const rect = fieldRects[index];

            ctx.fillStyle = index === this.selected ? "#24054A" : "#10021F";
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

            ctx.strokeStyle = index === this.selected ? "#FFE600" : "#FF2ED6";
            ctx.lineWidth = 3;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

            let text = field.value;

            if (field.secure) {
                text = "●".repeat(field.value.length);
            }

            if (text.length === 0) {
                text = field.label;
                ctx.fillStyle = "#777";
            } else {
                ctx.fillStyle = "#FFF";
            }

            ctx.font = `${Math.min(canvas.width * .035, 16)}px 'Press Start 2P'`;
            ctx.textAlign = "left";

            while (ctx.measureText(text).width > rect.width - 40) {
                text = text.substring(1);
            }

            if (index === this.selected && this.cursorVisible) {
                text += "|";
            }

            ctx.fillText(text, rect.x + 15, rect.y + rect.height / 2);
        });

        /* ERROR MESSAGE */
        if (this.errorMessage) {
            ctx.textAlign = "center";
            ctx.font = `${Math.min(canvas.width * .028, 13)}px 'Press Start 2P'`;
            ctx.fillStyle = "#FF4D6D";
            ctx.fillText(this.errorMessage, canvas.width / 2, buttonY - 35);
        }

        /* BUTTON CREATE ACCOUNT */
        ctx.textAlign = "center";
        ctx.font = `${Math.min(canvas.width * .04, 18)}px 'Press Start 2P'`;
        ctx.fillStyle = "#FFE600";
        ctx.fillText("[ CREATE ACCOUNT ]", canvas.width / 2, buttonY);

        /* BACK TO LOGIN */
        ctx.font = `${Math.min(canvas.width * .03, 14)}px 'Press Start 2P'`;
        ctx.fillStyle = "#A0D7FF";
        ctx.fillText("BACK TO LOGIN", canvas.width / 2, linkY);

        // Mantém os <input> reais grudados nas caixas desenhadas
        this.positionInputs();
    }

    private createInputs() {

        this.inputs = this.fields.map((field, index) => {

            const input = document.createElement("input");

            input.type = field.type ?? "text";
            input.maxLength = field.max;

            // Atributos importantes pra mobile:
            // - autocomplete/inputMode ajudam o teclado nativo a se comportar certo
            // - font-size 16px evita que o Safari dê zoom automático no foco
            if (field.type === "email") {
                input.inputMode = "email";
                input.autocomplete = "email";
            } else if (field.secure) {
                input.autocomplete = "new-password";
            } else {
                input.autocomplete = "username";
            }

            input.autocapitalize = "none";
            input.setAttribute("autocorrect", "off");
            input.spellcheck = false;

            const baseStyle: Partial<CSSStyleDeclaration> = {
                position: "fixed",
                opacity: "0",
                border: "0",
                outline: "none",
                padding: "0",
                margin: "0",
                background: "transparent",
                fontSize: "16px",
                zIndex: "1000",
                pointerEvents: "auto"
            };

            Object.assign(input.style, baseStyle);
            document.body.appendChild(input);

            input.addEventListener("input", () => {
                this.fields[index].value = input.value;
                this.errorMessage = "";
            });

            // Toque real do usuário no input -> sincroniza qual campo está selecionado
            input.addEventListener("focus", () => {
                this.selected = index;
            });

            return input;
        });
    }

    /**
     * Posiciona os <input> reais exatamente sobre as caixas desenhadas no canvas,
     * convertendo coordenadas internas do canvas (canvas.width/height) para
     * coordenadas CSS reais na tela (getBoundingClientRect), já que em telas
     * de alta densidade (retina/mobile) esses valores costumam ser diferentes.
     *
     * Isso é o que resolve o "não consigo clicar": antes os inputs ficavam
     * escondidos fora da tela e dependiam de focus() manual, o que é frágil
     * em mobile. Agora o dedo toca literalmente no <input> real.
     */
    private positionInputs() {

        if (!this.canvas) return;

        const canvas = this.canvas;
        const rect = canvas.getBoundingClientRect();

        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;

        const { fieldRects } = this.getLayout(canvas);

        this.inputs.forEach((input, index) => {
            const box = fieldRects[index];
            input.style.left = `${rect.left + box.x * scaleX}px`;
            input.style.top = `${rect.top + box.y * scaleY}px`;
            input.style.width = `${box.width * scaleX}px`;
            input.style.height = `${box.height * scaleY}px`;
        });
    }

    handleTouch(
        x: number,
        y: number
    ) {

        const canvas = this.canvas;
        const { buttonY, linkY } = this.getLayout(canvas);

        /* CREATE ACCOUNT BUTTON */
        if (
            y > buttonY - 30 &&
            y < buttonY + 30
        ) {
            this.trySubmit();
            return;
        }

        /* BACK TO LOGIN */
        if (
            y > linkY - 25 &&
            y < linkY + 25
        ) {
            this.onBackToLogin();
            return;
        }

        // Os campos de texto não precisam de hit-test manual aqui:
        // os <input> reais já estão fisicamente sobre essas áreas
        // (ver positionInputs), então o próprio toque do usuário já
        // foca o elemento certo antes mesmo de chegar em handleTouch.
    }

    private trySubmit() {

        const [username, email, password, confirmPassword] = this.fields.map(f => f.value);

        if (!username || !email || !password) {
            this.errorMessage = "FILL ALL FIELDS";
            return;
        }

        if (password !== confirmPassword) {
            this.errorMessage = "PASSWORDS DON'T MATCH";
            return;
        }

        this.errorMessage = "";
        this.onCreateAccount(username, email, password);
    }

    private removeInputs() {
        this.inputs.forEach(input => input.remove());
        this.inputs = [];
    }

    /*
        Suporte teclado físico
    */
    private onKeyDown = (e: KeyboardEvent) => {

        const activeIsInput = this.inputs.includes(document.activeElement as HTMLInputElement);

        switch (e.key) {

            case "ArrowDown":
                if (!activeIsInput) {
                    this.selected = (this.selected + 1) % this.fields.length;
                }
                return;

            case "ArrowUp":
                if (!activeIsInput) {
                    this.selected--;
                    if (this.selected < 0) this.selected = this.fields.length - 1;
                }
                return;

            case "Enter":
                this.trySubmit();
                return;
        }

        // Se o foco já está num <input> real, deixa o navegador cuidar
        // da digitação nativamente (evita duplicar caracteres, já que o
        // "input" listener acima também atualiza field.value).
        if (activeIsInput) return;

        const field = this.fields[this.selected];

        if (e.key === "Backspace") {
            field.value = field.value.slice(0, -1);
            return;
        }

        if (
            e.key.length === 1 &&
            field.value.length < field.max
        ) {
            field.value += e.key;
        }
    }
}


interface FieldConfig {
    label: string;
    value: string;
    max: number;
    secure?: boolean;
    type?: "text" | "email" | "password";
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}