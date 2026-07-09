export class Input{

    private jumpRequested=false;

    constructor(){
         // Mobile e mouse
        window.addEventListener("pointerdown", () => {
            this.jumpRequested = true;
        });

        // Teclado
        window.addEventListener("keydown", (event) => {

            if (
                event.code === "Space" ||
                event.code === "ArrowUp" ||
                event.code === "KeyW"
            ) {
                event.preventDefault(); // Evita rolar a página
                this.jumpRequested = true;
            }

        });
    }

    consumeJump(){
        const jump=this.jumpRequested;
        this.jumpRequested=false;
        return jump;
    }

}