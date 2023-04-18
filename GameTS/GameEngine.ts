import {DataBuffer} from "./DataBuffer.js";
import {Player,Enemy,Bullet} from "./Character.js";

export class GameWindow
{
   protected player:Player;
   protected enemies:Enemy[];
   protected bullets:Bullet[];

   constructor()
   {
      this.player = new Player(0,0);
      this.enemies = new Array<Enemy>();
      this.bullets = new Array<Bullet>();

      for(let i = 0; i < 3; i++)
      {
         this.enemies.push(new Enemy(80 + i * 80,50));
      }
   }

   AddBullets(transferBullets:Bullet[])
   {
      transferBullets.forEach( (bullet) => { this.bullets.push(bullet)} );
   }

   Update() : Bullet[]
   {
      this.player.Update();

      this.enemies.forEach( (enemy) => 
      {
         enemy.Update();
      });
      if(this.enemies[0].CheckMovementSwap() 
         || this.enemies[this.enemies.length - 1].CheckMovementSwap())
      {
         this.enemies.forEach( (enemy) => 
         {
            enemy.SwapMovement();
         });
      }

      var transferBullets:Bullet[] = new Array<Bullet>();
      var bulletsToRemove:number[] = new Array<number>();
      //get index of bullet and remember to remove via splice
      for(let i = 0; i < this.bullets.length; i++)
      {
         this.bullets[i].Update();
         if(this.bullets[i].ToDelete())
         {
            bulletsToRemove.push(i);
         }
         if(this.bullets[i].NextWindow())
         {
            bulletsToRemove.push(i);
            this.bullets[i].ToNextWindow();
            transferBullets.push(this.bullets[i]);
         }
      }
      for(let i = bulletsToRemove.length-1; i >= 0; i--)
      {
         this.bullets.splice(bulletsToRemove[i], 1);
      }

      if(this.player.Firing())
      {
         this.bullets.push(this.player.FireBullet());
      }

      //check for collisions
      return transferBullets;
   }

   UpdateFromInput(aInput:Record<string,boolean>)
   {
      this.player.ProcessInput(aInput);
      //need to check if new player status is same as before
      //if so do nothing, otherwise, need to call update chain?
   }

   Draw(aCtx:CanvasRenderingContext2D)
   {
      this.player.Draw(aCtx);
      this.enemies.forEach( (enemy) => { enemy.Draw(aCtx); });
      this.bullets.forEach( (bullet) => { bullet.Draw(aCtx); });
   }
}

export class GameState
{
   //hold all info necessary to store invidivual game states

   //want game state information to be stored in two separate containers
   //1 for homePlayer and 1 for awayPlayer
   //within the containers there is one player, and set of enemies, and bullets
   //location data is stored relative to that half of the screen with bottom left
   //being x:0 y:0

   //remember when updating movements of bullets, that we'll update their movements
   //in the window, and then if they move out of frame, remove from window
   //and place them in storage, to add after updating all other bullets
   //Do this to make certain we don't double update a bullet depending on
   //which window we would do first (would like to update homeWindow and then)
   //awayWindow in that order for each machine.

   //Because game is deterministic, all we really need to send back and forth
   //is gamer input on each frame. We don't need to send more than that.
   //So which buttons pressed and the frame pressed on.

   protected frameNumber:number;
   //protected windows:GameWindow[];
   protected homeWindow:GameWindow;
   protected awayWindow:GameWindow;
   //window[1] = awayWindow

   //protected homeWindow:GameWindow;
   //protected awayWindow:GameWindow;
   //protected timeStamp:Date;
   //protected enemies:Enemy[];
   //protected enemyMovement:number;//moveLeft if negative, right if positive
                                 //reset on 0 and number
   //protected players:Player[];
   //protected bullets:Character[];

   constructor(frame:number)
   {
      this.frameNumber = frame;
      this.homeWindow = new GameWindow();
      this.awayWindow = new GameWindow();
   }

   Clone(): GameState
   {
      let gameStateClone = new GameState(this.frameNumber);
      gameStateClone.homeWindow = this.homeWindow;
      gameStateClone.awayWindow = this.awayWindow;
      return gameStateClone;
   }

   Frame()
   {
      return this.frameNumber;
   }

   UpdateFromInput(keys:Record<string,boolean>)
   {
      this.awayWindow.UpdateFromInput(keys);
   }

   Update(keys:Record<string,boolean>) : void
   {
      this.frameNumber++;
      this.homeWindow.UpdateFromInput(keys);

      let transferBulletsToAway:Bullet[] = this.homeWindow.Update();
      let transferBulletsToHome:Bullet[] = this.awayWindow.Update();
      
      if(transferBulletsToAway.length > 0)
      {
         this.awayWindow.AddBullets(transferBulletsToAway);
      }
      if(transferBulletsToHome.length > 0)
      {
         this.homeWindow.AddBullets(transferBulletsToHome);
      }
   }

   NextFrame(keys:Record<string,boolean>) : GameState
   {
      let nextGameState = this.Clone(); 

      nextGameState.Update(keys);
      return nextGameState;
   }

   Draw(aCtx:CanvasRenderingContext2D)
   {
      let aCanvas = <HTMLCanvasElement> document.getElementById("canvas");
      aCtx.translate(0,(aCanvas.height/2));
      this.homeWindow.Draw(aCtx);
      aCtx.translate(aCanvas.width,0);
      aCtx.rotate(Math.PI);
      this.awayWindow.Draw(aCtx);
   }
}

export class GameEngine
{
   private gameStates:GameState[];
   private dataBuffer:DataBuffer;
   private currentFrame:number;

   private maxRollBackFrames:number;
   private frameAdvantageLimit:number;
   private initialFrame:number;
   private localFrame:number;
   private remoteFrame:number;
   private syncFrame:number;
   private remoteFrameAdvantage:number;


   constructor()
   {
      //Init player data
      this.dataBuffer = new DataBuffer();
      this.currentFrame = 0;

      this.initialFrame = 0;
      this.localFrame = this.initialFrame;
      this.remoteFrame = this.initialFrame;
      this.syncFrame = this.initialFrame;

      this.gameStates = new Array<GameState>();
      this.gameStates.push(new GameState(this.currentFrame));
   }

   Begin()
   {
      //this.dataBuffer.Connect();
   }

   Update(keys:Record<string,boolean>)
   {
      //this.dataBuffer.Send(new GameState(this.currentFrame));
      this.gameStates.push(this.gameStates[this.currentFrame].NextFrame(keys));
      this.currentFrame++;

      //UpdateNetwork
      //Pop frames from DataBuffer and use them to update GameStates on those frames
      //remoteFrame = latest frame from remote client
      //remoteFrameAdvantage = (localFrame - remoteFrame)


   }

   Draw(aCtx:CanvasRenderingContext2D)
   {
      this.gameStates[this.gameStates.length - 1].Draw(aCtx);
   }

   UpdateFrame(aFrame:number, aInput:Record<string,boolean>)
   {
      let firstFrame = this.gameStates[0].Frame();
      let index = aFrame - firstFrame;
      this.gameStates[index].UpdateFromInput(aInput);
   }

   UpdateChain(aFrame:number)
   {
      let finalFrame:number = this.gameStates[this.gameStates.length - 1].Frame();
      for(let i = aFrame; i < finalFrame; i++)
      {
         //this.gameStates[i+1] = this.gameStates[i].NextFrame();
      }
   }
}