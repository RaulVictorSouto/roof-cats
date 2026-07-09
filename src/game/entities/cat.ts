export class Cat {

    x = 120;
    y = 0;
    width = 55;
    height = 45;
    velocityY = 0;
    gravity = 1700;
    jumpForce = -700;
    grounded = false;
    private groundY: number = 0;

    maxJumps = 2;
    jumpCount = 0;

    constructor(groundY:number){
        this.y = groundY - this.height;
    }

    jump(){
        if(!this.grounded && this.jumpCount >= this.maxJumps)
            return;

        this.velocityY = this.jumpForce;
        this.grounded = false;
        this.jumpCount++;
    }

    update(delta:number){
        this.velocityY += this.gravity * delta;
        this.y += this.velocityY * delta;

        if(this.y >= this.groundY - this.height){
            this.y = this.groundY - this.height;
            this.velocityY = 0;
            this.grounded = true;
            this.jumpCount = 0;
        }
    }

    render(ctx:CanvasRenderingContext2D){
        ctx.fillStyle="#1EEBFF";
        ctx.shadowBlur=20;
        ctx.shadowColor="#1EEBFF";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur=0;
    }

    setGroundY(groundY: number) {
        this.groundY = groundY
    }
        
    getBounds() {
        return {
            x: this.x + 8,
            y: this.y + 6,
            width: this.width - 16,
            height: this.height - 10
        };
    }

}