// @flow
const assert = require('assert')
const express = require('express')
const path = require('path')
const app = express()
const GameEngine = require('./gameEngine')
const STATIC_DIR = path.join(__dirname.split('/').slice(0,-1).join('/'), '/webapp')
const bodyParser = require('body-parser')
const session = require('express-session')

const url = 'mongodb://localhost:27017/brickBreaker'
const mongoose = require('mongoose')
mongoose.connect(url)
const db = mongoose.connection
const User = require('./dbInitializer')

const userToSocket = require('./userSocketMap')
const userRoutes = require('./routes/user.routes')

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log('Connection successful !')
    User.update({}, {available: false}, {multi: true}, (err) => {
        if(err) console.error(err)
    })
    app.locals.db = db
})

app.use(express.static(STATIC_DIR))
app.use(bodyParser.json())
app.use(session({
    secret: "manafanam",
    resave: false,
    saveUninitialized: true
}))

app.use('/user', userRoutes);

const server = app.listen(3000, function () {
    console.log('App listening on port 3000!')
})


// SOCKETS...

const io = require('socket.io')(server)

let games = {}

io.on('connection', function(socket){

    console.log(`${socket.id} connected`)

    sendListUpdate(socket)

    // HOST SOCKET
    socket.on('create_game', (data) => {
        games[socket.id] = new GameEngine(data.name, socket)
        games[socket.id].emitState()
        notifyAllUpdate()
        console.log('Game created by ' + socket.id)

        socket.on('disconnect', () => {
            const game = games[socket.id]

            if(game) {
                if(game.guestName){
                    game.guestSocket.emit('opponent_left')
                    game.stop()
                    delete games[socket.id]
                } else {
                    delete games[socket.id]
                    notifyAllUpdate()
                }
            }

            console.log(`${socket.id} disconnected`)
        })

        socket.on('start_game', () => {
            let game = games[socket.id]
            if(game) {
                game.pause()
            }
        })
    })


    // GUEST SOCKET
    socket.on('join_game', (data) => {

        const {socketHostId, name} = data
        let game = games[socketHostId]
        if(game) {
            game.guestName = name
            game.guestSocket = socket
            game.emitState()
            notifyAllUpdate()
            socket.broadcast.to(data.socketHostId).emit('opponent_joined', {socketGuestId:socket.id, name})
            socket.on('disconnect', () => {
                if(games[socketHostId]){
                    games[socketHostId].stop()
                    delete games[socketHostId]
                    socket.broadcast.to(socketHostId).emit('opponent_left')
                }
                console.log(`${socket.id} disconnected`)
            })
        }
    })

    socket.on('message_sent', (data) => {
        socket.broadcast.to(data.opponentSocketId).emit('message_sent', data.message)
    })

    socket.on('mouse_move', ({y, hostSocketId}) => {
        if(games[hostSocketId]) games[hostSocketId].processMouseInput(socket, y)
    })

    socket.on('request_update', () => sendListUpdate(socket))

    socket.on('invitation_request', ({opponent, inviter}) => {
        const opponentSocketId: ?string = userToSocket.get(opponent)
        const invSocketId : ?string = userToSocket.get(inviter)
        if(opponentSocketId) {
            socket.to(opponentSocketId).emit('invitation', invSocketId)
        }
    })

})

const sendListUpdate = (socket) => {
    socket.emit('rooms_list_update', getGames())
}


const notifyAllUpdate = () => {
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

module.exports = io