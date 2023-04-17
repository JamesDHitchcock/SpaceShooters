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
}


export class Player extends Character
{
   moveLeft:boolean;
   moveRight:boolean;
   firing:boolean;
   timeSinceHit:number;

   constructor(x:number,y:number)
   {
      super(x,y);
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

      if(aInput["Space"] || aInput["Enter"])
      {
         this.firing = true;
      }
      if(!aInput["Space"] && !aInput["Enter"])
      {
         this.firing = false;
      }

   }

   Update(): void
   {
      if(this.moveLeft)
      {
         let prev = this.posX;
         this.posX -= this.toMove;
         if(this.posX < 20){
            //half player width from edge
            this.posX = prev;
         }
         this.moveLeft = false;
      }

      if(this.moveRight)
      {
         let prev = this.posX;
         this.posX += this.toMove;
         if(this.posX > 480){//need canvas link
            //do we link in player or do we create class that holds Update?
            this.posX = prev;
         }
         this.moveRight = false;
      }
   }

   Draw(aCtx:CanvasRenderingContext2D): void
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
   constructor(x:number,y:number)
   {
      super(x,y);
      this.width = 60;
      this.height = 60;
      this.fillStyle = "red";
      this.health = 3;
      this.toMove = 30;
      this.moveLeft = true;
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
         aCtx.fillStyle = this.fillStyle; 
         aCtx.fillRect(this.posX,this.posY,this.width,this.height);
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

   FiredByPlayer()
   {
      this.toMove = -this.toMove;
   }

   Update()
   {
      this.posY += this.toMove;
      let aCanvas = <HTMLCanvasElement> document.getElementById("canvas");
      if(this.posY < 0)
      {
         this.toDelete = true;
         this.nextWindow = true;
         this.posY = aCanvas.height/2 + this.posY;
         this.posX = aCanvas.width - this.posX;
      }
      if(this.posY > (aCanvas.height/2))
      {
         this.toDelete = true;
      }
   }
   
   Draw(aCtx:CanvasRenderingContext2D): void
   {
      aCtx.fillStyle = this.fillStyle; 
      aCtx.fillRect(this.posX,this.posY,this.width,this.height);
   }
}
