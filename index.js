const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, 'webapp')))

const server = app.listen(3000, function () {
    console.log('App listening on port 3000!')
})

const io = require('socket.io')(server)

let room = 0
let rooms = {}

io.on('connection', function(socket){
    socket.on('create_game', (data) => {
        const roomId = 'room' + room++
        console.log(data.name + ' created room: ' + roomId)
        socket.join(roomId)
        socket.emit('new_game_created', roomId)
        rooms[roomId] = {
            socket: socket,
            hostname: data.name
        }

        socket.on('disconnect', () => {
            delete rooms[roomId]
            socket.broadcast.to(roomId).emit('opponent_left')
            notifyUpdate()
        })

        notifyUpdate()
    })

    notifyUpdate()

    socket.on('join_game', (data) => {
        socket.join(data.roomId);
        rooms[data.roomId].socket.emit('opponent_joined', data.name)
        socket.emit('opponent_joined', rooms[data.roomId].hostname)
        socket.on('disconnect', () => {
            socket.broadcast.to(data.roomId).emit('opponent_left');
        })
    })

    socket.on('message_sent', (data) => {
        socket.broadcast.to(data.roomId).emit('send_to_room', data)
        socket.emit('send_to_room', data)
        console.log(`${data.author}: ${data.message} in ${data.roomId}`)
    })

    socket.on('start_game', (data) => {
        socket.broadcast.to(data.roomId).emit('game_started')
        socket.emit('game_started')
        console.log(`Game started in room: ${data.roomId}`)
    })

    socket.on('mouse_move', (data) => {
        socket.broadcast.to(data.roomId).emit('opponent_moved', data.y);
        //rooms[data.roomiD]
    })

})

const notifyUpdate = () => {
    io.emit('rooms_list_update', Object.keys(rooms).map(key => {
        return {
            hostname: rooms[key].hostname,
            roomId: key
        }
    }))
}