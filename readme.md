# BiliBili Live Room Connection

BiliBili 直播房间链接，用于连接到B站直播房间，支持TCP和WebSocket双协议，并且支持使用zlib压缩过的protover=2模式。

## 用法

首先要引进来，对不对？
``` 
var Room = require('bilibililiveroomconnection')
```

然后我们就应该创建一个房间（误）
```
var room = new Room(912226)
```

这个Room的用法是
```
Room(房间号,协议,版本)
```
房间号是完整房间号，短号请自行解析。

协议可以是tcp,ws,wss，对应TCP,WebSocket,WebSocket+SSL。

版本是0或2，当为2的时候服务器会发送zlib压缩过的数据包过来，我们已经做好了对应的解析。

然后我们监听下弹幕事件并且处理一下然后log出来吧
```
room.on('DANMU_MSG', (message) => {
    const decodedMessage = Room.danmuMessageDecoder(message)
    console.log(`${decodedMessage.userInfo.uname} : ${decodedMessage.comment}`)
})
```
其中 Room.danmuMessageDecoder 是内置的我个人总结的弹幕消息解析器，欢迎大家来帮我补充扩展。

你想要监听什么事件就对应的
```
room.on(cmd_name,(message)=>{})
```
未知的事件统一为 unknownCmd

如果你是全都要的话，你可以监听 '*' 事件

连接上是 connected

认证成功是 authSucceeded

心跳返回是 heartbeatReply

错误当然是 error

关闭就是 close

注册完你想要的事件监听器之后，就是连接上去啊！
```
room.connect()
```

## 作者的话

虽然是WTFPL协议，但希望大家可以给我来点Star和Thanks，谢谢大家。

第一次写这种东西，想能够帮到其他人吧。

顺带，最低带宽消耗的链接模式可能是Room(912226,'tcp',2)

具体我没有量化过，但你这种链接模式确实是可以的。。。