const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, 'webapp')))

const server = app.listen(3000, function () {
    console.log('App listening on port 3000!')
})

const io = require('socket.io')(server)

let games = {}

io.on('connection', function(socket){

    socket.emit('rooms_list_update', getGames())

    socket.on('create_game', (data) => {
        games[socket.id] = {
            hostName: data.name,
            guestName: '',
            guestSocketId: ''
        }
        notifyUpdate()
        console.log('Game created by ' + socket.id, games)

        socket.on('disconnect', () => {
            const game = games[socket.id]

            if(game.guestName){
                socket.broadcast.to(game.guestSocketId).emit('opponent_left')
                delete games[socket.id]
            } else {
                delete games[socket.id]
                notifyUpdate()
            }
        })
    })



    socket.on('join_game', (data) => {

        const {socketHostId, name} = data
        games[socketHostId].guestName = name
        games[socketHostId].guestSocketId = socket.id
        notifyUpdate()
        socket.broadcast.to(data.socketHostId).emit('opponent_joined', {socketGuestId:socket.id, name})
        socket.on('disconnect', () => {
            delete games[socketHostId]
            socket.broadcast.to(socketHostId).emit('opponent_left')
        })
    })



    //
    // socket.on('message_sent', (data) => {
    //     socket.broadcast.to(data.roomId).emit('send_to_room', data)
    //     socket.emit('send_to_room', data)
    //     console.log(`${data.author}: ${data.message} in ${data.roomId}`)
    // })
    //
    // socket.on('start_game', (data) => {
    //     socket.broadcast.to(data.roomId).emit('game_started')
    //     socket.emit('game_started')
    //     console.log(`Game started in room: ${data.roomId}`)
    // })
    //
    // socket.on('mouse_move', (data) => {
    //     socket.broadcast.to(data.roomId).emit('opponent_moved', data.y);
    //     //rooms[data.roomiD]
    // })

})

const notifyUpdate = () => {
    io.emit('rooms_list_update', getGames())
}

const getGames = () => {
    return Object.keys(games)
        .filter(socketHostId => !games[socketHostId].guestName)
        .map(socketHostId => {
            return {
                hostName: games[socketHostId].hostName,
                socketHostId
            }
        })
}