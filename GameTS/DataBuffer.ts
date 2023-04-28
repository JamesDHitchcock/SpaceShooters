 declare var Peer:any;
 declare var DataConnction:any;

 export class DataTransfer
 {
    public frameNumber:number;
    //protected frameAdvantage:number;
    public keys:Record<string,boolean> =
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

      this.peerInfo.on('connection', (conn) => {
         this.dataCon = conn;
         this.connectionEstablished = true;
         globalThis.game.AlertConnection();
         this.dataCon.on('data', (data) =>{
            this.dataBuffer.push(data);
            console.log(data);
         });
      });
   }

  public Connect(): void
   {
      let connectEle = <HTMLInputElement> document.getElementById("connectId");
      let connectText = connectEle.value;
      if(connectText.length > 2)
      {
         this.dataCon = this.peerInfo.connect(connectText);
         this.connectionEstablished = true;

         //need error checking
         this.dataCon.on('open', () => {

         });

         this.dataCon.on('data', (data) => {
            this.dataBuffer.push(data);
            console.log(data);
         });
      }
   }

   public Top() : DataTransfer
   {
      return this.dataBuffer.shift();
   }

   public Empty() : boolean
   {
      return (this.dataBuffer.length == 0);
   }

   public ConnectionEstablished(): boolean
   {
      return this.connectionEstablished;
   }

   public DisableConnection(): void
   {
      this.connectionEstablished = false;
   }

   public Send(dataToSend:DataTransfer): void
   {
      if(this.connectionEstablished)
      {
         this.dataCon.send(dataToSend);
      }
   }
 }
