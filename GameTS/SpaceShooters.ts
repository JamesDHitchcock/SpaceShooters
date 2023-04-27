import {GameEngine} from "./GameEngine.js";

export class SpaceShooters
{
   //Used for drawing
   private canvas:HTMLCanvasElement;
   private ctx:CanvasRenderingContext2D;
   private desiredFPS:number;
   private fpsInterval:number;
   private elapsedDrawTime:number;
   private lastDrawTime:number;
   private currentDrawTime:number;
   private font:string;
   private fontSize:number;
   private fontColor:string;
   //private stoppingTime:number;

   private gameEngine:GameEngine;
   
   private keys:Record<string,boolean> =
   {
      "a": false,
      "d": false,
      "ArrowLeft": false,
      "ArrowRight": false,
      " ": false,
      "Enter": false
   }

   constructor()
   {
      this.canvas = <HTMLCanvasElement> document.getElementById("canvas");
      this.ctx = this.canvas.getContext('2d');

      document.addEventListener('keyup', this.KeyUp.bind(this));
      document.addEventListener('keydown', this.KeyDown.bind(this));

      this.gameEngine = new GameEngine();
      this.gameEngine.Begin();

      this.fontSize = 48;
      this.font = "Arial"
      this.fontColor = "white";
      
      this.desiredFPS = 15;
      this.fpsInterval = 1000 / this.desiredFPS;
   }

   private KeyDown(event:KeyboardEvent): void
   {
      if(event.key in this.keys){
         this.keys[event.key] = true;
      }
      if(event.key == "A")
      {
         this.keys["a"] = true;
      }
      if(event.key == "D")
      {
         this.keys["d"] = true;
      }
   }

   private KeyUp(event:KeyboardEvent): void
   {
      if(event.key in this.keys){
         this.keys[event.key] = false;
      }
      if(event.key == "A")
      {
         this.keys["a"] = false;
      }
      if(event.key == "D")
      {
         this.keys["d"] = false;
      }
   }

   private DrawStars(): void
   {
      this.ctx.fillStyle='black';
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      this.ctx.fillStyle='white';
      let x = 0.1 * this.canvas.width;
      let y = 0.1 * this.canvas.height;

      for(let i = 0.05 * this.canvas.width; i < this.canvas.width; i = i + x){
         for(let j = 0.05 * this.canvas.height; j < this.canvas.height; j = j + y){
            this.ctx.fillRect(i,j,1,1);
         }
      }
   }

   private DrawHealthBar(): void
   {
      let numRedSquares:number = this.gameEngine.MaxHealthPool() - this.gameEngine.PlayerHealthPool();

      if(numRedSquares > this.gameEngine.MaxHealthPool())
      {
         numRedSquares = this.gameEngine.MaxHealthPool();
      }

      let numGreenSquares:number = this.gameEngine.MaxHealthPool() - numRedSquares;

      let x = 0.1 * this.canvas.width;
      let xWidth = Math.floor( (0.8 * this.canvas.width) / (this.gameEngine.MaxHealthPool()) );
      let y = this.canvas.height - 40;
      let yHeight = 30;
      let indent = 2;
      for(let i = 0; i < numGreenSquares; i++)
      {
         this.ctx.fillStyle = 'white';
         this.ctx.fillRect(x + (i*xWidth),y,xWidth,yHeight);

         this.ctx.fillStyle = 'green';
         this.ctx.fillRect( (x + (i*xWidth))+indent,y+indent,xWidth - 2*indent, yHeight - 2*indent);
      }
      for(let i = numGreenSquares; i < this.gameEngine.MaxHealthPool(); i++)
      {
         this.ctx.fillStyle = 'white';
         this.ctx.fillRect(x + (i*xWidth),y,xWidth,yHeight);

         this.ctx.fillStyle = 'red';
         this.ctx.fillRect( (x + (i*xWidth))+indent,y+indent,xWidth - 2*indent, yHeight - 2*indent);
      }

   }

   Animate()
   {
      requestAnimationFrame(() => this.Animate());
      this.currentDrawTime = performance.now();
      this.elapsedDrawTime = this.currentDrawTime - this.lastDrawTime; 

      if(this.elapsedDrawTime > this.fpsInterval){
         this.lastDrawTime = this.currentDrawTime - (this.elapsedDrawTime % this.fpsInterval);
         this.gameEngine.Update(this.keys);
         this.DrawNextFrame();
      }
   }

   DrawNextFrame()
   {
      this.ctx.setTransform(1,0,0,1,0,0);
      this.DrawStars();
      this.gameEngine.Draw(this.ctx);

      this.ctx.setTransform(1,0,0,1,0,0);
      
      this.DrawHealthBar();

      if(this.gameEngine.WaitMode())
      {
         this.ctx.fillStyle = this.fontColor;
         this.ctx.textAlign = "center"
         this.ctx.font = "bold " + this.fontSize.toString() + "px " + this.font;

         let xDraw = this.canvas.width/2;
         let yDraw = this.canvas.height/2;
         this.ctx.fillText(this.gameEngine.WaitMessage(),xDraw,yDraw);
      }
   }

   public Begin(): void
   {
      //begin animation
      this.lastDrawTime = performance.now();
      this.Animate();
   }
   Reset(aMode:string): void
   {
      this.gameEngine.Reset(aMode);
   }
}

