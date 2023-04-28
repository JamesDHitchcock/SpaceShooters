export class DataTransfer {
    constructor(aFrame, keys) {
        //protected frameAdvantage:number;
        this.keys = {
            "a": false,
            "d": false,
            "ArrowLeft": false,
            "ArrowRight": false,
            "Enter": false,
            "Space": false
        };
        this.frameNumber = aFrame;
        this.keys = keys;
    }
    Frame() {
        return this.frameNumber;
    }
    Keys() {
        return this.keys;
    }
}
export class DataBuffer {
    constructor() {
        this.dataBuffer = new Array();
        this.connectionEstablished = false;
        this.peerInfo = new Peer();
        this.peerInfo.on('open', (id) => {
            var peerIdEle = document.getElementById("peerId");
            peerIdEle.value = id;
        });
        this.peerInfo.on('error', (error) => {
            console.error(error);
            var peerIdEle = document.getElementById("peerId");
            peerIdEle.value = error;
        });
        this.peerInfo.on('connection', (conn) => {
            this.dataCon = conn;
            this.connectionEstablished = true;
            globalThis.game.AlertConnection();
            this.dataCon.on('data', (data) => {
                this.dataBuffer.push(data);
                console.log(data);
            });
        });
    }
    Connect() {
        let connectEle = document.getElementById("connectId");
        let connectText = connectEle.value;
        if (connectText.length > 2) {
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
    Top() {
        return this.dataBuffer.shift();
    }
    Empty() {
        return (this.dataBuffer.length == 0);
    }
    ConnectionEstablished() {
        return this.connectionEstablished;
    }
    DisableConnection() {
        this.connectionEstablished = false;
    }
    Send(dataToSend) {
        if (this.connectionEstablished) {
            this.dataCon.send(dataToSend);
        }
    }
}
//# sourceMappingURL=DataBuffer.js.map