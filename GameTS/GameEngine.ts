import {DataBuffer,DataTransfer} from "./DataBuffer.js";
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
         this.enemies.push(new Enemy(80 + i * 100,50));
      }
   }

   AddBullets(transferBullets:Bullet[])
   {
      transferBullets.forEach( (bullet) => { this.bullets.push(bullet)} );
   }

   ExtractPlayer(): Player
   {
      return this.player;
   }

   SetPlayerBehavior(aPlayer:Player)
   {
      this.player.SetPlayerInputStateFromPlayer(aPlayer);
   }

   EnemiesAllGone(): boolean
   {
      let allGone = true;
      this.enemies.forEach( (enemy) => 
      {
         if(enemy.Health() > 0)
         {
            allGone = false;
         }
      });

      return allGone;
   }

   Update(aFrame:number) : Bullet[]
   {
      this.player.Update();

      this.enemies.forEach( (enemy) => 
      {
         enemy.Update();
      });
      if(this.enemies.length > 0
         && (this.enemies[0].CheckMovementSwap() 
         || this.enemies[this.enemies.length - 1].CheckMovementSwap()))
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

      //check for collisions before player fires to reduce load
      //as there can be no collisions from player bullets on first frame
      bulletsToRemove = new Array<number>;

      for(let i = 0; i < this.bullets.length; i++)
      {
         if(this.player.CheckCollision(this.bullets[i]))
         {
            bulletsToRemove.push(i);
            this.player.TakeDamage();
         }

         this.enemies.forEach( (enemy) => 
         {
            if(this.bullets[i].CheckCollision(enemy))
            {
               bulletsToRemove.push(i);
               enemy.TakeDamage();
            }
         });
      }

      for(let i = bulletsToRemove.length-1; i >= 0; i--)
      {
         this.bullets.splice(bulletsToRemove[i], 1);
      }

      if(this.player.Firing(aFrame))
      {
         this.bullets.push(this.player.FireBullet(aFrame));
      }

      this.enemies.forEach( (enemy) =>
      {
         if(enemy.Firing(aFrame))
         {
            this.bullets.push(enemy.FireBullet(aFrame));
         }
      });

      return transferBullets;
   }
   
   UpdateFromInput(aInput:Record<string,boolean>): void
   {
      this.player.ProcessInput(aInput);
   }

   CheckAndUpdateFromInput(aInput:Record<string,boolean>): boolean
   {
      let testPlayer = new Player(0,0);
      testPlayer.ProcessInput(aInput);

      if(this.player.ComparePlayerInputState(testPlayer))
      {
         return false;//same player state, no need to update further
      }
      this.player.SetPlayerInputStateFromPlayer(testPlayer);
      //need to update further states, return true to let know
      return true;
      //need to check if new player status is same as before
      //if so do nothing, otherwise, need to call update chain?
   }

   RemoveAllEnemies()
   {
      this.enemies.splice(0,this.enemies.length);
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

   CheckAndUpdateFromInput(keys:Record<string,boolean>): boolean
   {
      return this.awayWindow.CheckAndUpdateFromInput(keys);
   }

   ExtractHomePlayer(): Player
   {
      return this.homeWindow.ExtractPlayer();
   }

   SetHomePlayerBehavior(aPlayer:Player): void
   {
      return this.homeWindow.SetPlayerBehavior(aPlayer);
   }

   ExtractAwayPlayer(): Player
   {
      return this.awayWindow.ExtractPlayer();
   }

   SetAwayPlayerBehavior(aPlayer:Player): void
   {
      this.awayWindow.SetPlayerBehavior(aPlayer);
   }

   PlayerHealthPool()
   {
      return (this.homeWindow.ExtractPlayer().Health()
               + this.awayWindow.ExtractPlayer().Health()
             ) - 10;
   }

   EnemiesAllGone(): boolean
   {
      return (this.homeWindow.EnemiesAllGone() && this.awayWindow.EnemiesAllGone());
   }

   Update() : void
   {
      this.frameNumber++;

      let transferBulletsToAway:Bullet[] = this.homeWindow.Update(this.frameNumber);
      let transferBulletsToHome:Bullet[] = this.awayWindow.Update(this.frameNumber);
      
      if(transferBulletsToAway.length > 0)
      {
         this.awayWindow.AddBullets(transferBulletsToAway);
      }
      if(transferBulletsToHome.length > 0)
      {
         this.homeWindow.AddBullets(transferBulletsToHome);
      }
   }

   UseInputAndGenerateNextFrame(keys:Record<string,boolean>): GameState
   {
      this.homeWindow.UpdateFromInput(keys);
      return this.NextFrame();
   }

   NextFrame() : GameState
   {
      let nextGameState = this.Clone(); 
      nextGameState.Update();
      return nextGameState;
   }

   RemoveAllEnemies()
   {
      this.homeWindow.RemoveAllEnemies();
      this.awayWindow.RemoveAllEnemies();
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
   private maxHealthPool:number;

   private maxRollBackFrames:number;
   private frameAdvantageLimit:number;
   private initialFrame:number;
   private localFrame:number;
   private remoteFrame:number;
   private syncFrame:number;
   private remoteFrameAdvantage:number;

   private mode:string;
   private waitMessage:string;

   constructor()
   {
      //Init player data
      this.dataBuffer = new DataBuffer();
      this.initialFrame = 0;
      this.localFrame = this.initialFrame;
      this.remoteFrame = this.initialFrame;
      this.syncFrame = this.initialFrame;

      this.maxRollBackFrames = 99;
      this.frameAdvantageLimit = 99;

      this.maxHealthPool = 10;

      this.gameStates = new Array<GameState>();
      this.gameStates.push(new GameState(this.initialFrame));

      this.mode = "wait"
      this.waitMessage = "Choose Mode";
   }

   Begin(): void
   {
      this.dataBuffer.Connect();
   }

   SinglePlayer(): boolean
   {
      return this.mode == "sp";
   }

   MultiPlayer(): boolean
   {
      return this.mode == "mp";
   }

   WaitMode(): boolean
   {
      return this.mode == "wait";
   }

   WaitMessage(): string
   {
      return this.waitMessage;
   }

   PlayerHealthPool(): number
   {
      return this.gameStates[this.gameStates.length - 1].PlayerHealthPool();
   }

   MaxHealthPool(): number
   {
      return this.maxHealthPool;
   }

   EnemiesAllGone(): boolean
   {
      return this.gameStates[this.gameStates.length - 1].EnemiesAllGone();
   }

   AlertConnection(): void
   {
      //want to reset to wait mode, and then go into multiplayer since
      //connection should now be established from other client that initiated
      //and no need for us to iniate back.
      this.Reset("wait");
      this.mode = "mp";
   }

   Reset(aMode: string): void
   {
      this.initialFrame = 0;
      this.localFrame = this.initialFrame;
      this.remoteFrame = this.initialFrame;
      this.syncFrame = this.initialFrame;

      this.maxRollBackFrames = 99;
      this.frameAdvantageLimit = 99;

      this.gameStates = new Array<GameState>();
      this.gameStates.push(new GameState(this.initialFrame));

      this.mode = aMode;

      if(this.MultiPlayer())
      {
         this.Begin();
         if(!this.dataBuffer.ConnectionEstablished())
         {
            this.mode = "wait";
            this.waitMessage = "Connection Error";
         }
      }
   }

   TimeSynched(): boolean
   {
      if(this.dataBuffer.ConnectionEstablished())
      {
         let localFrameAdvantage = this.localFrame - this.remoteFrame;
         let frameAdvantageDifference = localFrameAdvantage - this.remoteFrameAdvantage;
         return (localFrameAdvantage < this.maxRollBackFrames && frameAdvantageDifference < this.frameAdvantageLimit);
      }
      return true;
   }
   
   //Combine Check with Update
   CheckFrameAndUpdateInput(frameData:DataTransfer): boolean
   {
      let firstFrame = this.gameStates[0].Frame();
      let index = frameData.Frame() - firstFrame;
      return this.gameStates[index].CheckAndUpdateFromInput(frameData.Keys());
   }

   PredictAwayPlayerBehavior(aFrame:number)
   {
      let firstFrame = this.gameStates[0].Frame();
      let index = aFrame - firstFrame;
      let aPlayer = this.gameStates[index].ExtractAwayPlayer();
      for(let i = index+1; i < this.gameStates.length; i++)
      {
         this.gameStates[i].SetAwayPlayerBehavior(aPlayer);
      }
   }

   UpdateFromNetwork(): void
   {
      let needToUpdateChain:boolean = false;
      let smallestUpdateFrame:number = Number.MAX_SAFE_INTEGER;
      let largestRemoteFrame:number = 0;
      while(!this.dataBuffer.Empty())
      {
         let frameData:DataTransfer = this.dataBuffer.Top();
         if(frameData.Frame() > largestRemoteFrame)
         {
          largestRemoteFrame = frameData.Frame();  
         }

         if(this.CheckFrameAndUpdateInput(frameData))
         //Check Frame Input means we need to create a container for
         //input values of player, which are moveLeft, moveRight, and Firing
         //and check if updated values are same as old values.
         //Probably easiest to create a new Player object, have it process input
         //Write a comparison function PlayerCompareInputs() and then a
         //SetInputsByPlayer if needed.
         {
            //want to find the smallest numbered frame that needs update
            if(frameData.Frame() < smallestUpdateFrame)
            {
               smallestUpdateFrame = frameData.Frame();
            }

            //if CheckFrame ever returns true, regardless of which frame
            //it's on, we need to update current GameState. 
            needToUpdateChain = true;
         }
      }
      if(largestRemoteFrame > this.remoteFrame)
      {
         this.remoteFrame = largestRemoteFrame;
         this.remoteFrameAdvantage = this.localFrame = this.remoteFrame;
      }

      if(needToUpdateChain)
      {
         //set predictive behavior of away Player from most recent remoteFrame
         this.PredictAwayPlayerBehavior(this.remoteFrame);
         this.syncFrame = smallestUpdateFrame - 1;
      }
      else
      {
         //all predictive frame inputs are fine, set sync frame to most recent
         //frame with full data of home and away players
         if(this.localFrame > this.remoteFrame)
         {
            this.syncFrame = this.remoteFrame;
         }
         else
         {
            this.syncFrame = this.localFrame;
         }
      }
   }

   ExecuteRollback(aFrame:number): void
   {
      let finalFrame:number = this.gameStates[this.gameStates.length - 1].Frame();
      for(let i = aFrame; i < finalFrame; i++)
      {
         //need to save input states of these frames. Do we need to make deep copies?

         let homePlayer = this.gameStates[i+1].ExtractHomePlayer();
         let awayPlayer = this.gameStates[i+1].ExtractAwayPlayer();
         
         this.gameStates[i+1] = this.gameStates[i].NextFrame();
         this.gameStates[i+1].SetHomePlayerBehavior(homePlayer);
         this.gameStates[i+1].SetAwayPlayerBehavior(awayPlayer);
      }

   }

   CheckGameState(): void
   {
      if(this.PlayerHealthPool() <= 0)
      {
         this.mode = "wait";
         this.waitMessage = "You Lose";
      }
      if(this.EnemiesAllGone())
      {
         this.mode = "wait";
         this.waitMessage = "You Win!";
      }
   }

   Update(keys:Record<string,boolean>)
   {
      if(this.MultiPlayer())
      {
         //processes and network data and determines sync frame
         this.UpdateFromNetwork(); 

         //Rollback Condition
         if(this.localFrame > this.syncFrame && this.remoteFrame > this.syncFrame)
         {
            this.ExecuteRollback(this.syncFrame);
         }

         if(this.TimeSynched())
         {
            this.localFrame++;
            let aDataTransfer = new DataTransfer(this.localFrame,keys);
            this.dataBuffer.Send(aDataTransfer);

            this.gameStates.push(
               this.gameStates[this.gameStates.length - 1].UseInputAndGenerateNextFrame(keys)
            );
         }
         this.CheckGameState();
      }
      if(this.SinglePlayer())
      {
         this.localFrame++;
         let aPlayer = new Player(0,0);
         aPlayer.ProcessInput(keys);
         let lastIndex = this.gameStates.length - 1;
         this.gameStates[lastIndex].SetHomePlayerBehavior(aPlayer);
         this.gameStates[lastIndex].SetAwayPlayerBehavior(aPlayer);
         this.gameStates.push(this.gameStates[lastIndex].NextFrame());
         this.CheckGameState();
      }

      if(this.WaitMode())
      {
         if(this.localFrame == 0)
         {
            this.RemoveAllEnemies();
         }
         this.localFrame++;
         let aPlayer = new Player(0,0);
         let lastIndex = this.gameStates.length - 1;
         this.gameStates[lastIndex].SetAwayPlayerBehavior(aPlayer);
         aPlayer.ProcessInput(keys);
         this.gameStates[lastIndex].SetHomePlayerBehavior(aPlayer);
         this.gameStates.push(this.gameStates[lastIndex].NextFrame());
      }
   }

   RemoveAllEnemies()
   {
      let lastIndex = this.gameStates.length - 1;
      this.gameStates[lastIndex].RemoveAllEnemies();
   }

   Draw(aCtx:CanvasRenderingContext2D)
   {
      this.gameStates[this.gameStates.length - 1].Draw(aCtx);
   }
}