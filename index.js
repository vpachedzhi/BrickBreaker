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
        games[socket.id] = Game()
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

        socket.on('start_game', ({opponentSocketId}) => {
            let game = games[socket.id]
            game.start()
        })
    })


    // GUEST SOCKET
    socket.on('join_game', (data) => {

        const {socketHostId, name} = data
        let game = games[socketHostId]
        game.guestName = name
        game.guestSocket.id = socket.id
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
        games[hostSocketId].processMouseInput(socket, y)
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

const sendGameState = (socket) => {

}

const Game = (hostName, socket) => {
    return {
        hostName: data.name,
        hostSocket: socket,
        guestName: '',
        guestSocket: undefined,
        state: {
            ballX: 600,
            ballY: 590,
            dx: 7,
            dy: -7
        },
        processMouseInput: (socket, y) => {
            if(socket === this.hostSocket) {
                this.guestSocket.emit('opponent_moved', {y})
            } else {
                this.hostSocket.emit('opponent_moved', {y})
            }
        },
        start: () => {
            this.guestSocket.emit('game_started')
            this.hostSocket.emit('game_started')
            const {hostName, guestName} = games[socket.id]
            console.log(`Game started between:\nHost: ${hostName}\nGuest: ${guestName}`)

            const generateNewState = (oldState) => {
                const {ballX, ballY, dx, dy} = oldState,
                    canvas = {
                        width: 1200,
                        height: 600
                    },
                    ballRadius = 10,
                    paddleWidth = 20,
                    paddleHeight = 200

                let newState = {
                    ballX,
                    ballY,
                    dx,
                    dy
                }


                if(ballX + dx > canvas.width-ballRadius - paddleWidth || ballX + dx < ballRadius + paddleWidth) { // When ball is on the right side
                    newState.dx = -dx;
                }

                if(ballY + dy > canvas.height-ballRadius || ballY + dy < ballRadius) {
                    newState.dy = -dy;
                }


                newState.ballX += newState.dx
                newState.ballY += newState.dy

                return newState
            }

            let interval = setInterval(() => {
                const newState = generateNewState(games[socket.id].state)
                socket.broadcast.to(opponentSocketId).emit('new_game_state', newState)
                socket.emit('new_game_state', newState)
                games[socket.id].state = newState
            }, 10)

            setTimeout(() => {
                clearInterval(interval)
            }, 60000)

            const {hostName, guestName} = games[socket.id]
            console.log(`Game started between:\nHost: ${hostName}\nGuest: ${guestName}`)


        }
    }
}


