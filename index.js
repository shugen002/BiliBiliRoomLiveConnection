const EventEmitter = require('events')
const GoIMProtocol = require('goimprotocol')
const zlib = require('zlib')

class BiliBiliLiveRoomConnection extends EventEmitter {
    /**
     * 房间连接，记得调用connect才会连接
     * @param {Number} roomId 房间号
     * @param {"ws"|"wss"|"tcp"} type 连接类型
     * @param {0|2} version 版本，只有需要zlib压缩过的时候才需要给这个值
     */
    constructor (roomId = 912226, type = 'ws', version = 0) {
        super()
        this.roomId = roomId
        this.type = type
        this.version = version
    }

    connect () {
        const config = {
            host: 'broadcastlv.chat.bilibili.com',
            authInfo: {
                uid: Math.floor(Math.random() * 1000000),
                roomid: this.roomId
            }
        }
        if (this.version === 2) {
            config.authInfo.protover = 2
        }
        switch (this.type) {
        case 'tcp':
            config.type = 'tcp'
            config.port = 2243
            break
        case 'ws':
            config.type = 'websocket'
            config.path = 'sub'
            config.port = 2244
            config.wss = false
            break
        case 'wss':
            config.type = 'websocket'
            config.path = 'sub'
            config.port = 443
            config.wss = true
            break
        default:
            throw new Error(`Unknown connection type '${this.type}'`)
        }
        this.__connection = new GoIMProtocol.GoIMConnection(config)
        this.__connection.on('connect', this.__onConnect.bind(this))
        this.__connection.on('AuthSucceeded', this.__onAuthSucceeded.bind(this))
        this.__connection.on('message', this.__onMessage.bind(this))
        this.__connection.on('error', this.__onError.bind(this))
        this.__connection.on('close', this.__onClose.bind(this))
        this.__connection.connect()
    }

    __onConnect () {
        this.emit('connected')
    }

    __onAuthSucceeded (packet) {
        const message = JSON.parse(packet.body.toString())
        this.emit('authSucceeded', message)
        this.emit('*', message)
    }

    __onHeartbeatReply (packet) {
        const message = JSON.parse(packet.body.toString())
        this.emit('heartbeatReply', message)
        this.emit('*', message)
    }

    __onError (e) {
        this.emit('error', e)
    }

    __onClose (e) {
        this.__connection = null
        this.emit('close', e)
    }

    __onMessage (packet) {
        try {
            if (packet.protocolVersion === 2) {
                this.__connection.__onData.bind(this.__connection)(Buffer.from(zlib.inflateSync(packet.body)))
            } else {
                const message = JSON.parse(packet.body.toString())
                this.emit('*', message)
                if (message.cmd) {
                    this.emit(message.cmd, message)
                } else {
                    this.emit('unknownCmd', message)
                }
            }
        } catch (error) {
            this.emit('error', error)
        }
    }

    close () {
        this.__connection.close()
        this.__connection = null
    }

    /**
     * 弹幕解析，恶心的DANMU_MSG的终结者，这是我已知的，欢迎PR和我一起解析
     * @param {any} message 消息
     */
    static danmakuMessageDecoder (message) {
        var result = {}
        result.comment = message.info[1]
        result.danmakuSetting = {
            ka: message.info[0][0],
            mode: message.info[0][1], // 4:bottom 6:reverse 1:scroll 5:top
            fontsize: message.info[0][2],
            color: message.info[0][3],
            sendTime: message.info[0][4],
            dmid: message.info[0][5],
            // [0][6].[0][7],[0][8]
            type: message.info[0][9],
            chatBubbleType: message.info[0][10]
        }
        result.userInfo = {
            uid: message.info[2][0],
            uname: message.info[2][1],
            isAdmin: !!message.info[2][2],
            isVip: !!message.info[2][3],
            isSvip: !!message.info[2][4],
            rank: message.info[2][5],
            verify: !!message.info[2][6],
            usernameColor: message.info[2][7] || ''
        }
        result.medal = {
            level: message.info[3][0],
            label: message.info[3][1] || '--',
            anchorUsername: message.info[3][2] || '--',
            shortRoomID: message.info[3][3], // not right
            unknown: message.info[3][4] || null, // in official code......
            special: message.info[3][5] || ''
        }
        result.linkLevel = {
            level: message.info[4][0],
            // [4][1] [4][2]
            rank: message.info[4][3]
        }
        result.title = message.info[5]
        // [6]
        result.guardLevel = message.info[7]
        // [8]
        result.validation = {
            ts: message.info[9].ts || 0,
            ct: message.info[9].ct || ''
        }
        return result
    }
}

module.exports = BiliBiliLiveRoomConnection
