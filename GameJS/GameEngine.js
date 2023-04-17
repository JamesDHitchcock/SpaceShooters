import { DataBuffer } from "./DataBuffer.js";
import { Player, Enemy } from "./Character.js";
export class GameWindow {
    constructor() {
        this.player = new Player(0, 0);
        this.enemies = new Array();
        this.bullets = new Array();
        for (let i = 0; i < 3; i++) {
            this.enemies.push(new Enemy(80 + i * 80, 50));
        }
    }
    Update() {
        this.player.Update();
        this.enemies.forEach((enemy) => {
            enemy.Update();
        });
        if (this.enemies[0].CheckMovementSwap()
            || this.enemies[this.enemies.length - 1].CheckMovementSwap()) {
            this.enemies.forEach((enemy) => {
                enemy.SwapMovement();
            });
        }
        var transferBullets = new Array();
        var bulletsToRemove = new Array();
        //get index of bullet and remember to remove via splice
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].Update();
            if (this.bullets[i].ToDelete()) {
                bulletsToRemove.push(i);
            }
            if (this.bullets[i].NextWindow()) {
                transferBullets.push(this.bullets[i]);
            }
        }
        for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
            this.bullets.splice(bulletsToRemove[i], 1);
        }
        //check for collisions
        return transferBullets;
    }
    UpdateFromInput(aInput) {
        this.player.ProcessInput(aInput);
        //need to check if new player status is same as before
        //if so do nothing, otherwise, need to call update chain?
    }
    //takes the current game window and flips it to show above
    ConvertToTop() {
        return this;
    }
    Draw(aCtx) {
        this.player.Draw(aCtx);
        this.enemies.forEach((enemy) => { enemy.Draw(aCtx); });
        this.bullets.forEach((bullet) => { bullet.Draw(aCtx); });
    }
}
export class GameState {
    //window[0] = homeWindow
    //window[1] = awayWindow
    //protected homeWindow:GameWindow;
    //protected awayWindow:GameWindow;
    //protected timeStamp:Date;
    //protected enemies:Enemy[];
    //protected enemyMovement:number;//moveLeft if negative, right if positive
    //reset on 0 and number
    //protected players:Player[];
    //protected bullets:Character[];
    constructor(frame) {
        this.frameNumber = frame;
        this.windows = new Array();
        this.windows.push(new GameWindow());
        this.windows.push(new GameWindow());
    }
    Clone() {
        let gameStateClone = new GameState(this.frameNumber);
        for (let i = 0; i < this.windows.length; i++) {
            gameStateClone.windows[i] = this.windows[i];
        }
        return gameStateClone;
    }
    Frame() {
        return this.frameNumber;
    }
    UpdateFromInput(keys) {
        this.windows[1].UpdateFromInput(keys);
    }
    Update(keys) {
        this.frameNumber++;
        this.windows[0].UpdateFromInput(keys);
        for (let i = 0; i < this.windows.length; i++) {
            //update each window and handle bullet transfer
            this.windows[i].Update();
        }
    }
    NextFrame(keys) {
        let nextGameState = this.Clone();
        nextGameState.Update(keys);
        return nextGameState;
    }
    Draw(aCtx) {
        let aCanvas = document.getElementById("canvas");
        aCtx.translate(0, (aCanvas.height / 2));
        this.windows[0].Draw(aCtx);
        aCtx.translate(aCanvas.width, 0);
        aCtx.rotate(Math.PI);
        this.windows[1].Draw(aCtx);
    }
}
export class GameEngine {
    constructor() {
        //Init player data
        this.dataBuffer = new DataBuffer();
        this.currentFrame = 0;
        this.initialFrame = 0;
        this.localFrame = this.initialFrame;
        this.remoteFrame = this.initialFrame;
        this.syncFrame = this.initialFrame;
        this.gameStates = new Array();
        this.gameStates.push(new GameState(this.currentFrame));
    }
    Begin() {
        //this.dataBuffer.Connect();
    }
    Update(keys) {
        //this.dataBuffer.Send(new GameState(this.currentFrame));
        this.gameStates.push(this.gameStates[this.currentFrame].NextFrame(keys));
        this.currentFrame++;
        //UpdateNetwork
        //Pop frames from DataBuffer and use them to update GameStates on those frames
        //remoteFrame = latest frame from remote client
        //remoteFrameAdvantage = (localFrame - remoteFrame)
    }
    Draw(aCtx) {
        this.gameStates[this.gameStates.length - 1].Draw(aCtx);
    }
    UpdateFrame(aFrame, aInput) {
        let firstFrame = this.gameStates[0].Frame();
        let index = aFrame - firstFrame;
        this.gameStates[index].UpdateFromInput(aInput);
    }
    UpdateChain(aFrame) {
        let finalFrame = this.gameStates[this.gameStates.length - 1].Frame();
        for (let i = aFrame; i < finalFrame; i++) {
            //this.gameStates[i+1] = this.gameStates[i].NextFrame();
        }
    }
}
//# sourceMappingURL=GameEngine.js.map