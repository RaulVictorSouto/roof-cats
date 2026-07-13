export interface Scene {

    update(delta: number): void;

    render(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
    ): void;

    onEnter?(): void;

    onExit?(): void;

}