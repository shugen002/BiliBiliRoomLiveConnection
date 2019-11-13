const EventEmitter = require('events');
const GoIMProtocol = require("goimprotocol");

class BiliBiliLiveRoomConnection extends EventEmitter() {
    /**
     * 房间连接
     * @param {Number} roomId 房间号 
     * @param {"ws"|"wss"|"tcp"} type 连接类型 
     */
    constructor(roomId = 912226, type = "ws") {
        super();
        this.roomId = roomId;
        this.type = type
    }
    connect() {
        let config = {
            host: "broadcastlv.chat.bilibili.com",
            type: this.type,
            authInfo: {
                uid: Math.floor(Math.random() * 1000000),
                roomid: this.roomId
            }
        }
        switch (type) {
            case "tcp":
                config.port=2243;
                break;
            case "ws":
                config.port=2244;
                config.wss = false;
                break;
            case "wss":
                config.port = 443;
                config.wss = true;
                break
            default:
                throw new Error(`Unknown connection type '${this.type}'`)
                break;
        }
        this.__connection = new GoIMProtocol.GoIMConnection(config);
        this.__connection.on('connect',this.__onConnect.bind(this));
        this.__connection.on('AuthSucceeded',this.__onAuthSucceeded.bind(this));
    }
    __onConnect(){
        this.emit('__connect');
    }
    __onAuthSucceeded(){
        this.emit('__authSucceeded',JSON.stringify(packet.body.toString()))
    }
    __onHeartbeatReply(){
        this.emit('__heartbeatReply',JSON.stringify(packet.body.toString()))
    }
    __onError(e){
        this.emit('__error', e);
    }
    __onClose(e){
        this.__connection = null
        this.emit('__close',e);
    }
    __onMessage(packet){
        try {
            var message=JSON.stringify(packet.body.toString());
        } catch (error) {
            
        }
    }
    close(){
        this.__connection.close();
        this.__connection=null;
    }
}

module.exports = BiliBiliLiveRoomConnection