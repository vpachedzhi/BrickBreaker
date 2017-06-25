// @flow
const assert = require('assert')
const express = require('express')
const path = require('path')
const app = express()
const GameEngine = require('./gameEngine')
const STATIC_DIR = path.join(__dirname.split('/').slice(0,-1).join('/'), '/webapp')
const bodyParser = require('body-parser')
const session = require('express-session')

const User = require('./dbInitializer')

//const MongoClient = require('mongodb').MongoClient

const url = 'mongodb://localhost:27017/brickBreaker'
//
// MongoClient.connect(url, function(err, db) {
//     assert.equal(null, err);
//     console.log("Connected successfully to db server");
// }

const mongoose = require('mongoose')
mongoose.connect(url)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log('Connection successful !')
    app.locals.db = db
})
// MongoClient.connect(url, function(err, db) {
//     assert.equal(null, err);
//     console.log("Connected successfully to server");
//     app.locals.db = db
//     //db.close();
//})


app.use(express.static(STATIC_DIR))
app.use(bodyParser.json())
app.use(session({
    secret: "manafanam",
    resave: false,
    saveUninitialized: true
}))

const server = app.listen(3000, function () {
    console.log('App listening on port 3000!')
})

app.post('/register', (req, res) => {
    const {name, password} = req.body
    const user = new User({_id: name, password})
    user.save((err, data) => {
        if(err) {
            console.error(err)
            res.status(400).send()
        } else {
            res.status(201).json(data)
        }
    })
})

app.post('/login', (req, res) => {
    const {name, password} = req.body
    User.find({_id: name}, (err, users) => {
        if(err) {
            res.status(404).json("No such user!").send()
        } else {
            if(password == users[0].password) {
                req.session.user = users[0]
                res.status(202).send()
            } else {
                res.status(400).json("Invalid password!").send()
            }
        }
    })
})

app.get('/isLogged', (req, res) => {
    if(!req.session.user) {
        res.status(401).send()
    } else {
        res.status(200).send()
    }
})

app.get('/logout', (req, res) => {
    if(!req.session) {
        res.status(400)
    } else {
        req.session.destroy()
        res.status(200).send()
        console.log('  logged out')
    }
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