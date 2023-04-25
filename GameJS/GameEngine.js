import { DataBuffer, DataTransfer } from "./DataBuffer.js";
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
    AddBullets(transferBullets) {
        transferBullets.forEach((bullet) => { this.bullets.push(bullet); });
    }
    ExtractPlayer() {
        return this.player;
    }
    SetPlayerBehavior(aPlayer) {
        this.player.SetPlayerInputStateFromPlayer(aPlayer);
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
                bulletsToRemove.push(i);
                this.bullets[i].ToNextWindow();
                transferBullets.push(this.bullets[i]);
            }
        }
        for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
            this.bullets.splice(bulletsToRemove[i], 1);
        }
        if (this.player.Firing()) {
            this.bullets.push(this.player.FireBullet());
        }
        //check for collisions
        return transferBullets;
    }
    UpdateFromInput(aInput) {
        this.player.ProcessInput(aInput);
    }
    CheckAndUpdateFromInput(aInput) {
        let testPlayer = new Player(0, 0);
        testPlayer.ProcessInput(aInput);
        if (this.player.ComparePlayerInputState(testPlayer)) {
            return false; //same player state, no need to update further
        }
        this.player.SetPlayerInputStateFromPlayer(testPlayer);
        //need to update further states, return true to let know
        return true;
        //need to check if new player status is same as before
        //if so do nothing, otherwise, need to call update chain?
    }
    Draw(aCtx) {
        this.player.Draw(aCtx);
        this.enemies.forEach((enemy) => { enemy.Draw(aCtx); });
        this.bullets.forEach((bullet) => { bullet.Draw(aCtx); });
    }
}
export class GameState {
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
        this.homeWindow = new GameWindow();
        this.awayWindow = new GameWindow();
    }
    Clone() {
        let gameStateClone = new GameState(this.frameNumber);
        gameStateClone.homeWindow = this.homeWindow;
        gameStateClone.awayWindow = this.awayWindow;
        return gameStateClone;
    }
    Frame() {
        return this.frameNumber;
    }
    CheckAndUpdateFromInput(keys) {
        return this.awayWindow.CheckAndUpdateFromInput(keys);
    }
    ExtractHomePlayer() {
        return this.homeWindow.ExtractPlayer();
    }
    SetHomePlayerBehavior(aPlayer) {
        return this.homeWindow.SetPlayerBehavior(aPlayer);
    }
    ExtractAwayPlayer() {
        return this.awayWindow.ExtractPlayer();
    }
    SetAwayPlayerBehavior(aPlayer) {
        this.awayWindow.SetPlayerBehavior(aPlayer);
    }
    Update() {
        this.frameNumber++;
        let transferBulletsToAway = this.homeWindow.Update();
        let transferBulletsToHome = this.awayWindow.Update();
        if (transferBulletsToAway.length > 0) {
            this.awayWindow.AddBullets(transferBulletsToAway);
        }
        if (transferBulletsToHome.length > 0) {
            this.homeWindow.AddBullets(transferBulletsToHome);
        }
    }
    UseInputAndGenerateNextFrame(keys) {
        this.homeWindow.UpdateFromInput(keys);
        return this.NextFrame();
    }
    NextFrame() {
        let nextGameState = this.Clone();
        nextGameState.Update();
        return nextGameState;
    }
    Draw(aCtx) {
        let aCanvas = document.getElementById("canvas");
        aCtx.translate(0, (aCanvas.height / 2));
        this.homeWindow.Draw(aCtx);
        aCtx.translate(aCanvas.width, 0);
        aCtx.rotate(Math.PI);
        this.awayWindow.Draw(aCtx);
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
        this.maxRollBackFrames = 99;
        this.frameAdvantageLimit = 99;
        this.gameStates = new Array();
        this.gameStates.push(new GameState(this.currentFrame));
    }
    Begin() {
        this.dataBuffer.Connect();
    }
    TimeSynched() {
        let localFrameAdvantage = this.localFrame - this.remoteFrame;
        let frameAdvantageDifference = localFrameAdvantage - this.remoteFrameAdvantage;
        return (localFrameAdvantage < this.maxRollBackFrames && frameAdvantageDifference < this.frameAdvantageLimit);
    }
    //Combine Check with Update
    CheckFrameAndUpdateInput(frameData) {
        let firstFrame = this.gameStates[0].Frame();
        let index = frameData.Frame() - firstFrame;
        return this.gameStates[index].CheckAndUpdateFromInput(frameData.Keys());
    }
    PredictAwayPlayerBehavior(aFrame) {
        let firstFrame = this.gameStates[0].Frame();
        let index = aFrame - firstFrame;
        let aPlayer = this.gameStates[index].ExtractAwayPlayer();
        for (let i = index + 1; i < this.gameStates.length; i++) {
            this.gameStates[i].SetAwayPlayerBehavior(aPlayer);
        }
    }
    UpdateFromNetwork() {
        let needToUpdateChain = false;
        let smallestUpdateFrame = Number.MAX_SAFE_INTEGER;
        let largestRemoteFrame = 0;
        while (!this.dataBuffer.Empty()) {
            let frameData = this.dataBuffer.Top();
            if (frameData.Frame() > largestRemoteFrame) {
                largestRemoteFrame = frameData.Frame();
            }
            if (this.CheckFrameAndUpdateInput(frameData)) 
            //Check Frame Input means we need to create a container for
            //input values of player, which are moveLeft, moveRight, and Firing
            //and check if updated values are same as old values.
            //Probably easiest to create a new Player object, have it process input
            //Write a comparison function PlayerCompareInputs() and then a
            //SetInputsByPlayer if needed.
            {
                //want to find the smallest numbered frame that needs update
                if (frameData.Frame() < smallestUpdateFrame) {
                    smallestUpdateFrame = frameData.Frame();
                }
                //if CheckFrame ever returns true, regardless of which frame
                //it's on, we need to update current GameState. 
                needToUpdateChain = true;
            }
        }
        if (largestRemoteFrame > this.remoteFrame) {
            this.remoteFrame = largestRemoteFrame;
            this.remoteFrameAdvantage = this.localFrame = this.remoteFrame;
        }
        if (needToUpdateChain) {
            //set predictive behavior of away Player from most recent remoteFrame
            this.PredictAwayPlayerBehavior(this.remoteFrame);
            this.syncFrame = smallestUpdateFrame - 1;
        }
        else {
            //all predictive frame inputs are fine, set sync frame to most recent
            //frame with full data of home and away players
            if (this.localFrame > this.remoteFrame) {
                this.syncFrame = this.remoteFrame;
            }
            else {
                this.syncFrame = this.localFrame;
            }
        }
    }
    ExecuteRollback(aFrame) {
        let finalFrame = this.gameStates[this.gameStates.length - 1].Frame();
        for (let i = aFrame; i < finalFrame; i++) {
            //need to save input states of these frames. Do we need to make deep copies?
            let homePlayer = this.gameStates[i + 1].ExtractHomePlayer();
            let awayPlayer = this.gameStates[i + 1].ExtractAwayPlayer();
            this.gameStates[i + 1] = this.gameStates[i].NextFrame();
            this.gameStates[i + 1].SetHomePlayerBehavior(homePlayer);
            this.gameStates[i + 1].SetAwayPlayerBehavior(awayPlayer);
        }
    }
    Update(keys) {
        //this.dataBuffer.Send(new GameState(this.currentFrame));
        //this.gameStates.push(this.gameStates[this.currentFrame].NextFrame(keys));
        //this.currentFrame++;
        //processes and network data and determines sync frame
        this.UpdateFromNetwork();
        //Rollback Condition
        if (this.localFrame > this.syncFrame && this.remoteFrame > this.syncFrame) {
            this.ExecuteRollback(this.syncFrame);
        }
        if (this.TimeSynched()) {
            this.localFrame++;
            let aDataTransfer = new DataTransfer(this.localFrame, keys);
            this.dataBuffer.Send(aDataTransfer);
            this.gameStates.push(this.gameStates[this.gameStates.length - 1].UseInputAndGenerateNextFrame(keys));
        }
    }
    Draw(aCtx) {
        this.gameStates[this.gameStates.length - 1].Draw(aCtx);
    }
}
//# sourceMappingURL=GameEngine.js.map