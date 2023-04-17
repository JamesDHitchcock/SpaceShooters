export class DataBuffer {
    constructor() {
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
    Connect() {
        this.dataCon = this.peerInfo.connect(document.getElementById("connectId").textContent);
        //need error checking
        this.dataCon.on('open', function () {
            //Receive messages
            this.dataCon.on('data', (data) => {
                this.dataBuffer.push(data);
                console.log(`received: ${data}`);
            });
        });
    }
    Send(dataToSend) {
        this.dataCon.send(dataToSend);
    }
}
//# sourceMappingURL=DataBuffer.js.map