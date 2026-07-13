import type { Scene } from "./scene";

export class LoginScene implements Scene {

    private fields: FieldConfig[] = [
        { label: "USERNAME", value: "", max: 16 },
        { label: "PASSWORD", value: "", max: 20 }
    ];

    private selected = 0;

    private onLogin: (user: string, password: string) => void;
    private onRegister: () => void;

    private cursorVisible = true;
    private cursorTimer = 0;

    private usernameInput!: HTMLInputElement;
    private passwordInput!: HTMLInputElement;

    private canvas!: HTMLCanvasElement;

    private resizeHandler = () => this.positionInputs();

    constructor(
        onLogin: (user: string, password: string) => void,
        onRegister: () => void
    ) {
        this.onLogin = onLogin;
        this.onRegister = onRegister;
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
     * Usado pelo render(), pelo posicionamento dos <input> reais
     * e pelo handleTouch (para os botões), evitando qualquer
     * dessincronia entre o que é desenhado e o que é clicável.
     */
    private getLayout(canvas: HTMLCanvasElement) {

        const margin = 20;

        const cardWidth = Math.min(canvas.width - margin * 2, 430);
        const cardHeight = 420;

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

        return { x, y, cardWidth, cardHeight, fieldRects };
    }

    render(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
    ) {

        this.canvas = canvas;

        const { x, y, cardWidth, cardHeight, fieldRects } = this.getLayout(canvas);

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
        ctx.fillText("LOGIN", canvas.width / 2, y + 45);

        /* INPUTS (desenho visual, o input real fica invisível por cima) */
        this.fields.forEach((field, index) => {

            const rect = fieldRects[index];

            ctx.fillStyle = index === this.selected ? "#24054A" : "#10021F";
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

            ctx.strokeStyle = index === this.selected ? "#FFE600" : "#FF2ED6";
            ctx.lineWidth = 3;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

            let text = field.value;

            if (index === 1) {
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

        /* BUTTON LOGIN */
        ctx.textAlign = "center";
        ctx.font = `${Math.min(canvas.width * .04, 18)}px 'Press Start 2P'`;
        ctx.fillStyle = "#FFE600";
        ctx.fillText("[ LOGIN ]", canvas.width / 2, y + 300);

        /* REGISTER */
        ctx.font = `${Math.min(canvas.width * .03, 14)}px 'Press Start 2P'`;
        ctx.fillStyle = "#A0D7FF";
        ctx.fillText("CREATE ACCOUNT", canvas.width / 2, y + 350);

        // Mantém os <input> reais grudados nas caixas desenhadas
        this.positionInputs();
    }

    private createInputs() {

        this.usernameInput = document.createElement("input");
        this.passwordInput = document.createElement("input");

        this.usernameInput.type = "text";
        this.passwordInput.type = "password";

        this.usernameInput.maxLength = 16;
        this.passwordInput.maxLength = 20;

        // Atributos importantes pra mobile:
        // - autocomplete/autocapitalize/autocorrect evitam comportamentos
        //   estranhos do teclado nativo em iOS/Android
        // - font-size 16px evita que o Safari dê zoom automático no foco
        this.usernameInput.autocomplete = "username";
        this.usernameInput.autocapitalize = "none";
        this.usernameInput.setAttribute("autocorrect", "off");
        this.usernameInput.spellcheck = false;

        this.passwordInput.autocomplete = "current-password";
        this.passwordInput.autocapitalize = "none";
        this.passwordInput.setAttribute("autocorrect", "off");
        this.passwordInput.spellcheck = false;

        const baseStyle: Partial<CSSStyleDeclaration> = {
            position: "fixed",
            opacity: "0",
            border: "0",
            outline: "none",
            padding: "0",
            margin: "0",
            background: "transparent",
            fontSize: "16px", // essencial no iOS pra não dar zoom ao focar
            zIndex: "1000",
            pointerEvents: "auto"
        };

        Object.assign(this.usernameInput.style, baseStyle);
        Object.assign(this.passwordInput.style, baseStyle);

        document.body.appendChild(this.usernameInput);
        document.body.appendChild(this.passwordInput);

        this.usernameInput.addEventListener("input", () => {
            this.fields[0].value = this.usernameInput.value;
        });

        this.passwordInput.addEventListener("input", () => {
            this.fields[1].value = this.passwordInput.value;
        });

        // Toque real do usuário no input -> sincroniza qual campo está selecionado
        this.usernameInput.addEventListener("focus", () => { this.selected = 0; });
        this.passwordInput.addEventListener("focus", () => { this.selected = 1; });
    }

    /**
     * Posiciona os <input> reais exatamente sobre as caixas desenhadas no canvas,
     * convertendo coordenadas internas do canvas (canvas.width/height) para
     * coordenadas CSS reais na tela (getBoundingClientRect), já que em telas
     * de alta densidade (retina/mobile) esses valores costumam ser diferentes.
     *
     * Isso é o que resolve o "não consigo clicar": antes os inputs ficavam
     * escondidos fora da tela (top:-100px) e dependiam de handleTouch() acertar
     * a coordenada certa e chamar focus() manualmente — o que é frágil em mobile,
     * pois o toque nunca acontece de fato sobre um elemento focável e o iOS
     * costuma bloquear o teclado nesse cenário. Agora o dedo toca literalmente
     * no <input> real.
     */
    private positionInputs() {

        if (!this.canvas) return;

        const canvas = this.canvas;
        const rect = canvas.getBoundingClientRect();

        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;

        const { fieldRects } = this.getLayout(canvas);

        const apply = (input: HTMLInputElement, box: Rect) => {
            input.style.left = `${rect.left + box.x * scaleX}px`;
            input.style.top = `${rect.top + box.y * scaleY}px`;
            input.style.width = `${box.width * scaleX}px`;
            input.style.height = `${box.height * scaleY}px`;
        };

        apply(this.usernameInput, fieldRects[0]);
        apply(this.passwordInput, fieldRects[1]);
    }

    handleTouch(
        x: number,
        y: number
    ) {

        const canvas = this.canvas;
        const { y: cardY } = this.getLayout(canvas);

        /* LOGIN BUTTON */
        if (
            y > cardY + 270 &&
            y < cardY + 330
        ) {
            this.onLogin(
                this.fields[0].value,
                this.fields[1].value
            );
            return;
        }

        /* REGISTER */
        if (
            y > cardY + 330 &&
            y < cardY + 390
        ) {
            this.onRegister();
            return;
        }

        // USERNAME/PASSWORD não precisam mais de hit-test manual aqui:
        // os <input> reais já estão fisicamente sobre essas áreas
        // (ver positionInputs), então o próprio toque do usuário já
        // foca o elemento certo antes mesmo de chegar em handleTouch.
    }

    private removeInputs() {

        if (this.usernameInput) {
            this.usernameInput.remove();
        }

        if (this.passwordInput) {
            this.passwordInput.remove();
        }
    }

    /*
        Suporte teclado físico
    */
    private onKeyDown = (e: KeyboardEvent) => {

        const activeIsInput =
            document.activeElement === this.usernameInput ||
            document.activeElement === this.passwordInput;

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
                this.onLogin(
                    this.fields[0].value,
                    this.fields[1].value
                );
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
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
