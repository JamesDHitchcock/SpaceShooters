export class Character
{
   protected posX:number;
   protected posY:number;
   protected toMove:number;
   protected keys:Record<string,boolean>;
   protected width:number;
   protected height:number;
   protected fillStyle:string;
   protected health:number;
   
   constructor(x:number,y:number)
   {
      this.posX = x;
      this.posY = y;
   }

   Update(): void
   {

   }

   Draw(aCtx:CanvasRenderingContext2D): void
   {
   }

   PosX(): number
   {
      return this.posX;
   }
   PosY(): number
   {
      return this.posY;
   }
   SetPos(aPosX:number,aPosY:number): void
   {
      this.posX = aPosX;
      this.posY = aPosY;
   }
   ToMove(): number
   {
      return this.toMove;
   }
   SetToMove(aValue:number)
   {
      this.toMove = aValue;
   }
   Health(): number
   {
      return this.health;
   }
   Height(): number
   {
      return this.height;
   }
   Width(): number
   {
      return this.width;
   }
   SetFillStyle(aString:string): void
   {
      this.fillStyle = aString;
   }
   TakeDamage(): void
   {
      this.health--;
   }

   CheckCollision(aCharacter:Character): boolean
   {
      //can only collide with a living object
      if(aCharacter.Health() > 0)
      {
         let collisionCheck:boolean;
         collisionCheck = (
            ( (this.posY + this.height) < aCharacter.posY ) ||
            ( this.posY > (aCharacter.posY + aCharacter.height) ) ||
            ( (this.posX + this.width) <  aCharacter.posX ) ||
            ( this.posX > (aCharacter.posX + aCharacter.width) )
         )
         return !collisionCheck;
      }
      return false;
   }
}


export class Player extends Character
{
   moveLeft:boolean;
   moveRight:boolean;
   firing:boolean;
   frameLastFired:number;
   framesBetweenShots:number;
   timeSinceHit:number;
   img:HTMLImageElement;

   constructor(x:number,y:number)
   {
      super(x,y);
      this.moveLeft = false;
      this.moveRight = false;

      this.firing = false;
      this.framesBetweenShots = 3;
      this.frameLastFired = -this.framesBetweenShots;

      this.toMove = 20;
      this.posX = 263;
      this.posY = 290;
      this.width = 50;
      this.height = 50;
      this.fillStyle = "yellow";
      this.health = 10;

      this.img = new Image(this.width,this.height);
      this.img.src = "../Resources/homePlayer.png";
   }
   
   ProcessInput(aInput:Record<string,boolean>)
   {
      if(aInput["a"] || aInput["ArrowLeft"])
      {
         this.moveLeft = true;
      }
      if(!aInput["a"] && !aInput["ArrowLeft"])
      {
         this.moveLeft = false;
      }

      if(aInput["d"] || aInput["ArrowRight"])
      {
         this.moveRight = true;
      }
      if(!aInput["d"] && !aInput["ArrowRight"])
      {
         this.moveRight = false;
      }
      

      if(this.moveLeft && this.moveRight)
      {
         this.moveLeft = false;
         this.moveRight = false;
      }

      if(aInput[" "] || aInput["Enter"])
      {
         this.firing = true;
      }
      if(!aInput[" "] && !aInput["Enter"])
      {
         this.firing = false;
      }
   }
   
   CheckCollision(aCharacter:Character): boolean
   {
      let collisionCheck:boolean;
      let indent = 10;
      let xPos = this.posX;
      let yPos = this.posY;

      //Give player a little more leeway on taking damage by using indent
      collisionCheck = (
         ( (yPos + this.height - indent) < aCharacter.PosY() ) ||
         ( yPos + indent > (aCharacter.PosY() + aCharacter.Height()) ) ||
         ( (xPos + this.width - indent) <  aCharacter.PosX() ) ||
         ( xPos + indent > (aCharacter.PosX() + aCharacter.Width()) )
      )
      return !collisionCheck;
   }

   ComparePlayerInputState(aPlayer: Player): boolean
   {
      if(aPlayer.moveLeft == this.moveLeft
         && aPlayer.moveRight == this.moveRight
         && aPlayer.firing == this.firing)
      {
         return true;
      }
      return false;
   }

   SetPlayerInputStateFromPlayer(aPlayer: Player): void
   {
      this.moveLeft = aPlayer.moveLeft;
      this.moveRight = aPlayer.moveRight;
      this.firing = aPlayer.firing;
   }

   Firing(aFrame:number): boolean
   {
      return this.firing && (aFrame > this.frameLastFired + this.framesBetweenShots);
   }

   FireBullet(aFrame:number): Bullet   
   {
      this.frameLastFired = aFrame;
      let aBullet = new Bullet(0,0);
      aBullet.SetPos(this.posX + this.width/2 - aBullet.Width()/2, 
                     this.posY-aBullet.Height());
      aBullet.SetFiredByPlayer();
      return aBullet;
   }

   Update(): void
   {
      if(this.moveLeft)
      {
         let prev = this.posX;
         this.posX -= this.toMove;
         if(this.posX < this.width/2){
            //half player width from edge
            this.posX = prev;
         }
      }

      if(this.moveRight)
      {
         let prev = this.posX;
         this.posX += this.toMove;
         let aCanvas = <HTMLCanvasElement> document.getElementById("canvas");
         if(this.posX > (aCanvas.width - this.width/2) ){
            this.posX = prev;
         }
      }
   }

   TakeDamage(): void
   {
      this.health--;
   }

   Draw(aCtx:CanvasRenderingContext2D): void
   {
      aCtx.drawImage(this.img,this.posX,this.posY);
   }

   DrawTriangle(aCtx:CanvasRenderingContext2D): void
   {
      aCtx.fillStyle = this.fillStyle;
      aCtx.beginPath();
      aCtx.moveTo(this.posX, this.posY);
      aCtx.lineTo(this.posX - this.width/2, this.posY + this.height);
      aCtx.lineTo(this.posX + this.width/2, this.posY + this.height);
      aCtx.closePath();
      aCtx.fill();
   }
}

export class Enemy extends Character
{
   private moveLeft:boolean
   frameLastFired:number;
   framesBetweenShots:number;
   img:HTMLImageElement;

   constructor(x:number,y:number)
   {
      super(x,y);
      this.width = 50;
      this.height = 50;
      this.fillStyle = "red";
      this.health = 3;
      this.toMove = 30;
      this.moveLeft = true;

      this.frameLastFired = 0;
      this.framesBetweenShots = 12;

      this.img = new Image(this.width, this.height);
      this.img.src = "../Resources/enemy.png";
   }

   SwapMovement()
   {
      this.moveLeft = !this.moveLeft;
   }

   CheckMovementSwap(): boolean
   {
      let aCanvas = <HTMLCanvasElement> document.getElementById("canvas");
      if(    
         (this.moveLeft && (this.posX - this.toMove) < 0)
         || ( (!this.moveLeft) && (this.posX + this.toMove + this.width) > aCanvas.width) 
      )
      {
         return true;
      }
      return false;
   }

   Firing(aFrame:number): boolean
   {
      return ( (aFrame > (this.frameLastFired + this.framesBetweenShots))
               && this.health > 0);
   }

   FireBullet(aFrame:number): Bullet   
   {
      this.frameLastFired = aFrame;
      let aBullet = new Bullet(0,0);
      aBullet.SetPos(this.posX + this.width/2 - aBullet.Width()/2, 
                     this.posY + this.height);
      aBullet.SetToMove(aBullet.ToMove()/2);
      aBullet.SetFillStyle(this.fillStyle);
      return aBullet;
   }

   Update(): void 
   {
      if(this.moveLeft)
      {
         this.posX -= this.toMove;
      }
      else
      {
         this.posX += this.toMove;
      }
   }
   
   Draw(aCtx:CanvasRenderingContext2D): void
   {
      if(this.health > 0)
      {
         aCtx.drawImage(this.img,this.posX,this.posY);
      }
   }
}

export class Bullet extends Character
{
   nextWindow:boolean;
   toDelete:boolean;

   constructor(x:number,y:number)
   {
      super(x,y);
      this.width = 10;
      this.height = 30;
      this.toMove = 30;
      this.fillStyle = "blue";
      this.nextWindow = false;
      this.toDelete = false;
   }

   NextWindow(): boolean
   {
      return this.nextWindow;
   }

   ToDelete(): boolean
   {
      return this.toDelete;
   }

   SetFiredByPlayer()
   {
      this.toMove = -this.toMove;
   }

   ToNextWindow()
   {
      this.nextWindow = false;
   }

   Update()
   {
      this.posY += this.toMove;
      let aCanvas = <HTMLCanvasElement> document.getElementById("canvas");
      if(this.posY < 0)
      {
         this.nextWindow = true;
         this.posY = -this.posY-this.height; 
         this.posX = aCanvas.width - this.posX - this.width;
         this.toMove = -this.toMove;
      }
      if(this.posY > (aCanvas.height/2))
      {
         this.toDelete = true;
      }
   }
   
   Draw(aCtx:CanvasRenderingContext2D): void
   {
      aCtx.fillStyle = "white";
      aCtx.fillRect(this.posX,this.posY,this.width,this.height);
      let indent = 2;
      aCtx.fillStyle = this.fillStyle; 
      aCtx.fillRect(this.posX + indent,this.posY + indent,this.width-2*indent,this.height-2*indent);
   }
}
