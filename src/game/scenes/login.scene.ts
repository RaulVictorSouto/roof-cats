import type { Scene } from "./scene";

export class LoginScene implements Scene {

    private fields: FieldConfig[] = [
        { label: "EMAIL", value: "", max: 32, type: "email" },
        { label: "PASSWORD", value: "", max: 20, secure: true, type: "password" }
    ];

    private selected = 0;

    private errorMessage = "";
    private loading = false;

    private onLogin: (email: string, password: string) => void;
    private onRegister: () => void;

    private cursorVisible = true;
    private cursorTimer = 0;

    private emailInput!: HTMLInputElement;
    private passwordInput!: HTMLInputElement;

    private canvas!: HTMLCanvasElement;

    private resizeHandler = () => this.positionInputs();

    constructor(
        onLogin: (email: string, password: string) => void,
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
     * Chamado de fora (Engine) quando a API responde com erro
     * (credenciais inválidas, erro de rede, etc).
     */
    setError(message: string) {
        this.errorMessage = message;
        this.loading = false;
    }

    /**
     * Chamado de fora (Engine) antes/depois de chamar a API,
     * pra travar reenvio duplicado e mostrar feedback visual.
     */
    setLoading(loading: boolean) {
        this.loading = loading;
        if (loading) this.errorMessage = "";
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

        return {
            x, y, cardWidth, cardHeight,
            fieldRects,
            buttonY: y + 300,
            linkY: y + 350
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

        /* BUTTON LOGIN */
        ctx.textAlign = "center";
        ctx.font = `${Math.min(canvas.width * .04, 18)}px 'Press Start 2P'`;
        ctx.fillStyle = this.loading ? "#777" : "#FFE600";
        ctx.fillText(this.loading ? "[ LOADING... ]" : "[ LOGIN ]", canvas.width / 2, buttonY);

        /* REGISTER */
        ctx.font = `${Math.min(canvas.width * .03, 14)}px 'Press Start 2P'`;
        ctx.fillStyle = "#A0D7FF";
        ctx.fillText("CREATE ACCOUNT", canvas.width / 2, linkY);

        // Mantém os <input> reais grudados nas caixas desenhadas
        this.positionInputs();
    }

    private createInputs() {

        this.emailInput = document.createElement("input");
        this.passwordInput = document.createElement("input");

        this.emailInput.type = "email";
        this.passwordInput.type = "password";

        this.emailInput.maxLength = this.fields[0].max;
        this.passwordInput.maxLength = this.fields[1].max;

        // Atributos importantes pra mobile:
        // - autocomplete/inputMode ajudam o teclado nativo a se comportar certo
        // - font-size 16px evita que o Safari dê zoom automático no foco
        this.emailInput.inputMode = "email";
        this.emailInput.autocomplete = "email";
        this.emailInput.autocapitalize = "none";
        this.emailInput.setAttribute("autocorrect", "off");
        this.emailInput.spellcheck = false;

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
            fontSize: "16px",
            zIndex: "1000",
            pointerEvents: "auto"
        };

        Object.assign(this.emailInput.style, baseStyle);
        Object.assign(this.passwordInput.style, baseStyle);

        document.body.appendChild(this.emailInput);
        document.body.appendChild(this.passwordInput);

        this.emailInput.addEventListener("input", () => {
            this.fields[0].value = this.emailInput.value;
            this.errorMessage = "";
        });

        this.passwordInput.addEventListener("input", () => {
            this.fields[1].value = this.passwordInput.value;
            this.errorMessage = "";
        });

        // Toque real do usuário no input -> sincroniza qual campo está selecionado
        this.emailInput.addEventListener("focus", () => { this.selected = 0; });
        this.passwordInput.addEventListener("focus", () => { this.selected = 1; });
    }

    /**
     * Posiciona os <input> reais exatamente sobre as caixas desenhadas no canvas,
     * convertendo coordenadas internas do canvas para coordenadas CSS reais na
     * tela (getBoundingClientRect), já que em telas de alta densidade essas
     * proporções costumam ser diferentes.
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

        apply(this.emailInput, fieldRects[0]);
        apply(this.passwordInput, fieldRects[1]);
    }

    handleTouch(
        x: number,
        y: number
    ) {

        if (this.loading) return;

        const canvas = this.canvas;
        const { buttonY, linkY } = this.getLayout(canvas);

        /* LOGIN BUTTON */
        if (y > buttonY - 30 && y < buttonY + 30) {
            this.trySubmit();
            return;
        }

        /* REGISTER */
        if (y > linkY - 25 && y < linkY + 25) {
            this.onRegister();
            return;
        }

        // EMAIL/PASSWORD não precisam de hit-test manual aqui:
        // os <input> reais já estão fisicamente sobre essas áreas
        // (ver positionInputs).
    }

    private trySubmit() {

        const [email, password] = this.fields.map(f => f.value);

        if (!email || !password) {
            this.errorMessage = "FILL ALL FIELDS";
            return;
        }

        this.errorMessage = "";
        this.onLogin(email, password);
    }

    private removeInputs() {

        if (this.emailInput) {
            this.emailInput.remove();
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
            document.activeElement === this.emailInput ||
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
                if (!this.loading) this.trySubmit();
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