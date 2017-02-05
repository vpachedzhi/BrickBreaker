const {canvas, ballRadius, paddle} = require('./webapp/config')
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

    sendListUpdate(socket)

    // HOST SOCKET
    socket.on('create_game', (data) => {
        games[socket.id] = new Game(data.name, socket)
        notifyAllUpdate()
        console.log('Game created by ' + socket.id, games)

        socket.on('disconnect', () => {
            const game = games[socket.id]

            if(game && game.guestName){
                game.guestSocket.emit('opponent_left')
                delete games[socket.id]
            } else {
                delete games[socket.id]
                notifyAllUpdate()
            }
            console.log(`${socket.id} disconnected`)
        })

        socket.on('start_game', () => {
            games[socket.id].start()
        })
    })


    // GUEST SOCKET
    socket.on('join_game', (data) => {

        const {socketHostId, name} = data
        let game = games[socketHostId]
        game.guestName = name
        game.guestSocket = socket
        notifyAllUpdate()
        socket.broadcast.to(data.socketHostId).emit('opponent_joined', {socketGuestId:socket.id, name})
        socket.on('disconnect', () => {
            delete games[socketHostId]
            socket.broadcast.to(socketHostId).emit('opponent_left')
            console.log(`${socket.id} disconnected`)
        })
    })

    socket.on('message_sent', (data) => {
        socket.broadcast.to(data.opponentSocketId).emit('message_sent', data.message)
        console.log(data.message)
    })

    socket.on('mouse_move', ({y, hostSocketId}) => {
        if(games[hostSocketId]) games[hostSocketId].processMouseInput(socket, y)
    })

    socket.on('ball_missed', (data) => {
        const game = games[data.hostSocketId]
        if(socket.id === data.hostSocketId) {
            console.log("Host ", data.hostSocketId, " missed ball")
        } else {
            console.log("Guest ", socket.id, " missed ball")
        }
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

class Game  {
    constructor (hostName, socket) {
        this.hostName = hostName
        this.hostSocket = socket
        this.guestName = ''
        this.guestSocket = undefined
        this.state = {
            ballX: canvas.width/2,
            ballY: canvas.height-ballRadius,
            dx: 7,
            dy: -7,
            hostY: canvas.height/2,
            guestY: canvas.height/2
        }
    }

    processMouseInput(socket, y) {
        if(socket === this.hostSocket) {
            this.state.hostY = y
        } else {
            this.state.guestY = y
        }
    }

    mutateState() {

        if(this.state.ballX + this.state.dx > canvas.width-ballRadius - paddle.width
            || this.state.ballX + this.state.dx < ballRadius + paddle.width) {
            this.state.dx = -this.state.dx;
        }

        if(this.state.ballY + this.state.dy > canvas.height-ballRadius || this.state.ballY + this.state.dy < ballRadius) {
            this.state.dy = -this.state.dy;
        }

        this.state.ballX += this.state.dx
        this.state.ballY += this.state.dy
    }

    start() {
        this.guestSocket.emit('game_started')
        this.hostSocket.emit('game_started')
        const {hostName, guestName} = this
        let interval = setInterval(() => {
            this.mutateState()
            this.hostSocket.emit('new_game_state', this.state)
            this.guestSocket.emit('new_game_state', this.state)
        }, 10)

        setTimeout(() => {
            clearInterval(interval)
        }, 60000)


        console.log(`Game started between:\nHost: ${hostName}\nGuest: ${guestName}`)
    }
}


