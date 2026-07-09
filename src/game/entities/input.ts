export class Input{

    private jumpRequested=false;

    constructor(){
        window.addEventListener("pointerdown",()=>{
            this.jumpRequested=true;
        });
    }

    consumeJump(){
        const jump=this.jumpRequested;
        this.jumpRequested=false;
        return jump;
    }

}