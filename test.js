var Room = require('./index.js')
var room = new Room(912226, 'wss', 2)
room.connect()
room.on('connected', () => {
    console.log("Now , you can send some danmaku to author's live room.")
    console.log('https://live.bilibili.com/912226')
    console.log('Then , you will see something log to the console.')
})
room.on('*', console.log)
