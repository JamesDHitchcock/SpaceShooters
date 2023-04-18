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
   private stoppingTime:number;

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
      
      this.desiredFPS = 30;
      this.fpsInterval = 1000 / this.desiredFPS;
   }

   private KeyDown(event:KeyboardEvent): void
   {
      if(event.key in this.keys){
         this.keys[event.key] = true;
      }
   }

   private KeyUp(event:KeyboardEvent): void
   {
      if(event.key in this.keys){
         this.keys[event.key] = false;
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
   }

   public Begin(): void
   {
      //begin animation
      this.lastDrawTime = performance.now();
      this.Animate();
   }

   public GameLoop(): void
   {
      //this.stoppingTime = performance.now() + 10000;
   }
}

export class DataTransfer
{
   protected frameNumber:number
   protected keys:Record<string,boolean> =
   {
      "a": false,
      "d": false,
      "ArrowLeft": false,
      "ArrowRight": false,
      "Enter": false,
      "Space": false
   }
}