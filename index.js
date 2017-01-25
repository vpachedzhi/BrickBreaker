const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, 'webapp')))

const server = app.listen(3000, function () {
    console.log('Chat app listening on port 3000!')
})

const io = require('socket.io')(server)

var room = 0
var rooms = {}

io.on('connection', function(socket){
    socket.on('create_game', (data) => {
        var roomId = 'room' + room++
        console.log(data.name + ' created room: ' + roomId)

        rooms[roomId] = {
            socket: socket.join(roomId, () => {
                socket.emit('new_game', roomId)
            }),
            hostName: data.name
        }

        io.emit('rooms_list_update', Object.keys(rooms).map(key => {
            return {
                hostName: rooms[key].hostName,
                roomId: key
            }
        }))
    })

    io.emit('rooms_list_update', Object.keys(rooms).map(key => {
        return {
            hostName: rooms[key].hostName,
            roomId: key
        }
    }))

    socket.on('join_game', (data) => {
        rooms[data.roomId].socket.emit('user_joined', data.name)
    })

    socket.on('disconnect', function () {

        //socket.emit('disconnected');
        console.log('user disconected')
    });

})





//chat.emit('message', {message: 'hiihihihih'})

//chat.on('message', (data) => console.log(data))

// io.on('connection', (socket) => {
//     console.log('a user connected')
//     socket.emit('message', {message:'you just connected mofo!'})
//     socket.on('disconnect', () => {
//         console.log('user disconnected')
//     })
//     socket.on('message', (data) => console.log(data.message))
// })