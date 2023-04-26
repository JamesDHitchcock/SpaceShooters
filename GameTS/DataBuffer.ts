 declare var Peer:any;
 declare var DataConnction:any;

 export class DataTransfer
 {
    protected frameNumber:number;
    //protected frameAdvantage:number;
    protected keys:Record<string,boolean> =
    {
       "a": false,
       "d": false,
       "ArrowLeft": false,
       "ArrowRight": false,
       "Enter": false,
       "Space": false
    };

    constructor(aFrame:number, keys:Record<string,boolean>)
    {
      this.frameNumber = aFrame;
      this.keys = keys;
    }

    Frame() : number
    {
      return this.frameNumber;
    }

    Keys() : Record<string,boolean>
    {
      return this.keys;
    }
 }

 export class DataBuffer
 {
   private peerInfo;//:Peer;
   private dataCon;//:DataConnection;
   private connectionEstablished:boolean;
   private dataBuffer:DataTransfer[];
   constructor()
   {
      this.dataBuffer = new Array<DataTransfer>();
      this.connectionEstablished = false;
      this.peerInfo = new Peer();
      this.peerInfo.on('open', (id) => {
         var peerIdEle = <HTMLInputElement> document.getElementById("peerId");
         peerIdEle.value = id;
      }
      );
      this.peerInfo.on('error', (error) => { 
         console.error(error); 
         var peerIdEle = <HTMLInputElement> document.getElementById("peerId");
         peerIdEle.value = error;
      });
   }

  public Connect(): void
   {
      let connectText:string = document.getElementById("connectId").textContent
      if(connectText.length > 2)
      {
         this.dataCon = this.peerInfo.connect(connectText);
         this.connectionEstablished = true;

         //need error checking
         this.dataCon.on('open', function() {
            //Receive messages
            this.dataCon.on('data', (data) => {
               this.dataBuffer.push(data); 
               console.log(`received: ${data}`); 
            });
         });
      }
   }

   Top() : DataTransfer
   {
      return this.dataBuffer.shift();
   }

   Empty() : boolean
   {
      return (this.dataBuffer.length == 0);
   }

   ConnectionEstablished(): boolean
   {
      return this.connectionEstablished;
   }

   public Send(dataToSend:DataTransfer): void
   {
      if(this.connectionEstablished)
      {
         this.dataCon.send(dataToSend);
      }
   }
 }
