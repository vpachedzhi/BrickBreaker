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
const User = require('./models/userSchema')
const Game = require('./models/gameSchema')
const dbInit = require('./models/dbInitializer')

const userToSocket = require('./userSocketMap')
const userRoutes = require('./routes/user.routes')
const gameRoutes = require('./routes/game.routes')

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log('Connection successful !')
    User.update({}, {available: false}, {multi: true}, (err) => {
        if(err) console.error(err)
    })
    dbInit()
    app.locals.db = db
})

app.use(express.static(STATIC_DIR))
app.use(bodyParser.json())
app.use(session({
    secret: "manafanam",
    resave: false,
    saveUninitialized: true
}))

app.use('/user', userRoutes)
app.use('/game', gameRoutes)

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

    socket.on('mouse_move', ({y, hostName}) => {
        const hostSocketId = userToSocket.get(hostName)
        if(hostSocketId && games[hostSocketId]) games[hostSocketId].processMouseInput(y, socket.id)
    })

    socket.on('request_update', () => sendListUpdate(socket))

    socket.on('invitation_request', ({opponent, invitee}) => {
        makeUnavailable(invitee)
        const opponentSocketId: ?string = userToSocket.get(opponent)
        const invSocketId : ?string = userToSocket.get(invitee)
        if(opponentSocketId) {
            socket.join(invitee)
            socket.to(opponentSocketId).emit('invitation', {invSocketId, invitee})
        }
    })

    socket.on('decline', (userName: string) => {
        const socketId: ?string = userToSocket.get(userName)
        makeAvailable(userName)
        if(socketId)
            socket.to(socketId).emit('declined')
    })

    socket.on('cancel', (userName: string) => {
        console.log(userName + ' declined')
        makeAvailable(userName)
    })

    socket.on('accept', ({invitee, invited}:{invitee:string, invited: string}) => {
        makeUnavailable(invited)
        const inviteeSid: ?string = userToSocket.get(invitee)
        const invitedSid: ?string = userToSocket.get(invited)
        if(inviteeSid && invitedSid){
            socket.to(inviteeSid).emit('accepted')

            socket.join(inviteeSid)
            io.to(inviteeSid).emit('game_ready', {invited, invitedSid: socket.id, invitee, inviteeSid})
            const game = new GameEngine(inviteeSid, invitedSid, io, (hostWon) => {
                new Game({host: invitee, guest: invited,
                    winner: hostWon ? invitee : invited,
                    date: new Date()}).save()
                makeAvailable(invitee)
                makeAvailable(invited)
            })

            games[inviteeSid] = game
            game.emitState()

            console.log('Game created by ' + invitee)
        }
    })

    socket.on('start_game', () => {
        const game = games[socket.id]
        if(game) {
            game.pause()
        }
    })

    socket.on('disconnect', () => {
        const name = getNameBySocketId(socket.id)
        makeUnavailable(name)
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

const getNameBySocketId = (socketId) => {
    const it = userToSocket.keys()
    let k: Object = it.next()
    while(k.value) {
        if(userToSocket.get(k.value) === socketId) {
            return k.value
        }
        k = it.next()
    }
}

const makeAvailable = (user) => {
    User.findByIdAndUpdate(user, {$set: {available: true}}, (err) => {})
}

const makeUnavailable = (user) => {
    User.findByIdAndUpdate(user, {$set: {available: false}}, (err) => {})
}

module.exports = io