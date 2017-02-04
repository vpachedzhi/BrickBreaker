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

    console.log(`${socket.id} connected`)

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
            console.log(`${socket.id} disconnected`)
        })

        socket.on('start_game', ({opponentSocketId}) => {
            socket.broadcast.to(opponentSocketId).emit('game_started')
            socket.emit('game_started')
            const {hostName, guestName} = games[socket.id]
            console.log(`Game started between:\nHost: ${hostName}\nGuest: ${guestName}`)
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
            console.log(`${socket.id} disconnected`)
        })
    })

    socket.on('message_sent', (data) => {
        socket.broadcast.to(data.opponentSocketId).emit('message_sent', data.message)
    })
    //
    //

    socket.on('mouse_move', ({y, opponentSocketId}) => {
        socket.broadcast.to(opponentSocketId).emit('opponent_moved', {y});
    })

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