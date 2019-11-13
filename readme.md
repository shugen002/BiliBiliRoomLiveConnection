# BiliBili Live Room Connection

BiliBili 直播房间链接，用于连接到B站直播房间，支持TCP和WebSocket双协议。

## 用法

## 例子

```
const BiliBiliRoomLiveConnection = require('BiliBiliRoomLiveConnection');

var connection = new BiliBiliRoomLiveConnection(912226);

connection.on('__close',function(e){
    if(e)this.connect();
})

connection.on('DANMU_MSG',function(e){
    // 你B的数据里面最恶心的就是弹幕的数据，所以需要翻译一下。。。
    var danmu =BiliBiliRoomLiveConnection.danmutranslator(e);
    console.log(`$(danmu.username) : $(danmu.content)`)
})
connection.connect()
```