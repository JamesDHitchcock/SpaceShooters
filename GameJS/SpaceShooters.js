import { GameEngine } from "./GameEngine.js";
export class SpaceShooters {
    constructor() {
        this.keys = {
            "a": false,
            "d": false,
            "ArrowLeft": false,
            "ArrowRight": false,
            " ": false,
            "Enter": false
        };
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext('2d');
        document.addEventListener('keyup', this.KeyUp.bind(this));
        document.addEventListener('keydown', this.KeyDown.bind(this));
        this.gameEngine = new GameEngine();
        this.gameEngine.Begin();
        this.fontSize = 48;
        this.font = "Arial";
        this.fontColor = "white";
        this.desiredFPS = 15;
        this.fpsInterval = 1000 / this.desiredFPS;
    }
    KeyDown(event) {
        if (event.key in this.keys) {
            this.keys[event.key] = true;
        }
    }
    KeyUp(event) {
        if (event.key in this.keys) {
            this.keys[event.key] = false;
        }
    }
    DrawStars() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        let x = 0.1 * this.canvas.width;
        let y = 0.1 * this.canvas.height;
        for (let i = 0.05 * this.canvas.width; i < this.canvas.width; i = i + x) {
            for (let j = 0.05 * this.canvas.height; j < this.canvas.height; j = j + y) {
                this.ctx.fillRect(i, j, 1, 1);
            }
        }
    }
    Animate() {
        requestAnimationFrame(() => this.Animate());
        this.currentDrawTime = performance.now();
        this.elapsedDrawTime = this.currentDrawTime - this.lastDrawTime;
        if (this.elapsedDrawTime > this.fpsInterval) {
            this.lastDrawTime = this.currentDrawTime - (this.elapsedDrawTime % this.fpsInterval);
            this.gameEngine.Update(this.keys);
            this.DrawNextFrame();
        }
    }
    DrawNextFrame() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.DrawStars();
        this.gameEngine.Draw(this.ctx);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (this.gameEngine.WaitMode()) {
            this.ctx.fillStyle = this.fontColor;
            this.ctx.textAlign = "center";
            this.ctx.font = "bold " + this.fontSize.toString() + "px " + this.font;
            let xDraw = this.canvas.width / 2;
            let yDraw = this.canvas.height / 2;
            this.ctx.fillText(this.gameEngine.WaitMessage(), xDraw, yDraw);
        }
    }
    Begin() {
        //begin animation
        this.lastDrawTime = performance.now();
        this.Animate();
    }
    Reset(aMode) {
        this.gameEngine.Reset(aMode);
    }
}
//# sourceMappingURL=SpaceShooters.js.map