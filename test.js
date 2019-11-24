var Room = require('./index.js')
var room = new Room(912226, 'tcp', 2)
room.connect()
room.on('authSucceeded', () => {
    console.log("Now , you can send some danmaku to author's live room.")
    console.log('https://live.bilibili.com/912226')
    console.log('Then , you will see something log to the console.')
})
room.on('*', console.log) // 输出所有的消息
room.on('DANMU_MSG', (message) => {
    const decodedMessage = Room.danmakuMessageDecoder(message)
    console.log(`${decodedMessage.userInfo.uname} : ${decodedMessage.comment}`)
})
