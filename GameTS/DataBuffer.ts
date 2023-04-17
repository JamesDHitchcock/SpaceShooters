 declare var Peer:any;
 declare var DataConnction:any;

 export class DataBuffer
 {
   private peerInfo;//:Peer;
   private dataCon;//:DataConnection;
   private dataBuffer:[];
   constructor()
   {
      this.peerInfo = new Peer();
      //peer connection works, focus on implementing game logic for now
      /*this.peerInfo.on('open', (id) => {
         var peerIdEle = <HTMLInputElement> document.getElementById("peerId");
         peerIdEle.value = id;
      }
      );
      this.peerInfo.on('error', (error) => { 
         console.error(error); 
         var peerIdEle = <HTMLInputElement> document.getElementById("peerId");
         peerIdEle.value = error;
      });*/
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

   public Send(dataToSend:DataTransfer): void
   {
      this.dataCon.send(dataToSend);
   }
 }
