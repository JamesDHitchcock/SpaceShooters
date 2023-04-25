export class Character {
    constructor(x, y) {
        this.posX = x;
        this.posY = y;
    }
    Update() {
    }
    Draw(aCtx) {
    }
    PosX() {
        return this.posX;
    }
    PosY() {
        return this.posY;
    }
    SetPos(aPosX, aPosY) {
        this.posX = aPosX;
        this.posY = aPosY;
    }
    Health() {
        return this.health;
    }
    Height() {
        return this.height;
    }
    Width() {
        return this.width;
    }
}
export class Player extends Character {
    constructor(x, y) {
        super(x, y);
        this.moveLeft = false;
        this.moveRight = false;
        this.firing = false;
        this.toMove = 20;
        this.posX = 144;
        this.posY = 300;
        this.width = 50;
        this.height = 50;
        this.fillStyle = "yellow";
        this.health = 10;
    }
    ProcessInput(aInput) {
        if (aInput["a"] || aInput["ArrowLeft"]) {
            this.moveLeft = true;
        }
        if (!aInput["a"] && !aInput["ArrowLeft"]) {
            this.moveLeft = false;
        }
        if (aInput["d"] || aInput["ArrowRight"]) {
            this.moveRight = true;
        }
        if (!aInput["d"] && !aInput["ArrowRight"]) {
            this.moveRight = false;
        }
        if (this.moveLeft && this.moveRight) {
            this.moveLeft = false;
            this.moveRight = false;
        }
        if (aInput[" "] || aInput["Enter"]) {
            this.firing = true;
        }
        if (!aInput[" "] && !aInput["Enter"]) {
            this.firing = false;
        }
    }
    ComparePlayerInputState(aPlayer) {
        if (aPlayer.moveLeft == this.moveLeft
            && aPlayer.moveRight == this.moveRight
            && aPlayer.firing == this.firing) {
            return true;
        }
        return false;
    }
    SetPlayerInputStateFromPlayer(aPlayer) {
        this.moveLeft = aPlayer.moveLeft;
        this.moveRight = aPlayer.moveRight;
        this.firing = aPlayer.firing;
    }
    Firing() {
        return this.firing;
    }
    FireBullet() {
        let aBullet = new Bullet(0, 0);
        aBullet.SetPos(this.posX - aBullet.Width() / 2, this.posY - aBullet.Height());
        aBullet.SetFiredByPlayer();
        return aBullet;
    }
    Update() {
        if (this.moveLeft) {
            let prev = this.posX;
            this.posX -= this.toMove;
            if (this.posX < 20) {
                //half player width from edge
                this.posX = prev;
            }
            this.moveLeft = false;
        }
        if (this.moveRight) {
            let prev = this.posX;
            this.posX += this.toMove;
            if (this.posX > 480) { //need canvas link
                //do we link in player or do we create class that holds Update?
                this.posX = prev;
            }
            this.moveRight = false;
        }
    }
    Draw(aCtx) {
        aCtx.fillStyle = this.fillStyle;
        aCtx.beginPath();
        aCtx.moveTo(this.posX, this.posY);
        aCtx.lineTo(this.posX - this.width / 2, this.posY + this.height);
        aCtx.lineTo(this.posX + this.width / 2, this.posY + this.height);
        aCtx.closePath();
        aCtx.fill();
    }
}
export class Enemy extends Character {
    constructor(x, y) {
        super(x, y);
        this.width = 60;
        this.height = 60;
        this.fillStyle = "red";
        this.health = 3;
        this.toMove = 30;
        this.moveLeft = true;
    }
    SwapMovement() {
        this.moveLeft = !this.moveLeft;
    }
    CheckMovementSwap() {
        let aCanvas = document.getElementById("canvas");
        if ((this.moveLeft && (this.posX - this.toMove) < 0)
            || ((!this.moveLeft) && (this.posX + this.toMove + this.width) > aCanvas.width)) {
            return true;
        }
        return false;
    }
    Update() {
        if (this.moveLeft) {
            this.posX -= this.toMove;
        }
        else {
            this.posX += this.toMove;
        }
    }
    Draw(aCtx) {
        if (this.health > 0) {
            aCtx.fillStyle = this.fillStyle;
            aCtx.fillRect(this.posX, this.posY, this.width, this.height);
        }
    }
}
export class Bullet extends Character {
    constructor(x, y) {
        super(x, y);
        this.width = 10;
        this.height = 30;
        this.toMove = 30;
        this.fillStyle = "blue";
        this.nextWindow = false;
        this.toDelete = false;
    }
    NextWindow() {
        return this.nextWindow;
    }
    ToDelete() {
        return this.toDelete;
    }
    SetFiredByPlayer() {
        this.toMove = -this.toMove;
    }
    ToNextWindow() {
        this.nextWindow = false;
    }
    Update() {
        this.posY += this.toMove;
        let aCanvas = document.getElementById("canvas");
        if (this.posY < 0) {
            this.nextWindow = true;
            this.posY = -this.posY - this.height;
            this.posX = aCanvas.width - this.posX - this.width;
            this.toMove = -this.toMove;
        }
        if (this.posY > (aCanvas.height / 2)) {
            this.toDelete = true;
        }
    }
    Draw(aCtx) {
        aCtx.fillStyle = this.fillStyle;
        aCtx.fillRect(this.posX, this.posY, this.width, this.height);
    }
}
//# sourceMappingURL=Character.js.map