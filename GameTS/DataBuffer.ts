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
   private dataBuffer:DataTransfer[];
   constructor()
   {
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
      this.dataCon = this.peerInfo.connect(document.getElementById("connectId").textContent);
      //need error checking
      this.dataCon.on('open', function() {
         //Receive messages
         this.dataCon.on('data', (data) => {
            this.dataBuffer.push(data); 
            console.log(`received: ${data}`); 
         });
      });
   }

   Top() : DataTransfer
   {
      return this.dataBuffer.shift();
   }

   Empty() : boolean
   {
      return (this.dataBuffer.length > 0);
   }

   public Send(dataToSend:DataTransfer): void
   {
      this.dataCon.send(dataToSend);
   }
 }
