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
        games[socket.id] = new GameEngine(data.name, socket, games)
        notifyAllUpdate()
        console.log('Game created by ' + socket.id)

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
            notifyAllUpdate()
            socket.broadcast.to(data.socketHostId).emit('opponent_joined', {socketGuestId:socket.id, name})
            socket.on('disconnect', () => {
                delete games[socketHostId]
                socket.broadcast.to(socketHostId).emit('opponent_left')
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

class GameEngine  {
    constructor (hostName, socket, allGames) {
        this.allGames = allGames
        this.hostName = hostName
        this.hostSocket = socket
        this.guestName = ''
        this.guestSocket = undefined
        this.state = {
            ballX: canvas.width/2,
            ballY: canvas.height-ballRadius,
            dx: 7, // TODO get out
            dy: -7, // TODO
            hostY: canvas.height/2,
            guestY: canvas.height/2,
            ballCollided: false
        }

        this.score = {
            host: 0,
            hostLives: 1, // TODO : lives   constant
            guest: 0,
            guestLives: 1
        }

        this.pauseInterval = undefined

        this.running = false
        this.engineInterval = undefined
        this.gamePhase = 0  // TODO : applyto speed and make constant
    }

    processMouseInput(socket, y) {
        if(socket === this.hostSocket) {
            this.state.hostY = y
        } else {
            this.state.guestY = y
        }
    }

    mutateState() {
        this.state.ballCollided = false

        if(this.state.ballX + this.state.dx > canvas.width - ballRadius - paddle.width) { // GUEST side/right

            if(this.state.ballY < this.state.guestY - paddle.height/2 // GUEST miss
                || this.state.ballY > this.state.guestY + paddle.height/2) {
                // TODO:     2. Change dY/X depending on where paddle is hit
                this.state.dx = -this.state.dx
                this.state.ballCollided = true
                this.takeLife()
                this.updateScore()
            } else {
                this.state.dx = -this.state.dx
                this.state.ballCollided = true
            }
        }
        else if(this.state.ballX + this.state.dx < ballRadius + paddle.width) { // HOST side/left

            if(this.state.ballY < this.state.hostY - paddle.height/2  // HOST miss
                || this.state.ballY > this.state.hostY + paddle.height/2) {
                this.state.dx = -this.state.dx
                this.state.ballCollided = true
                this.takeLife(true)
                this.updateScore()
            } else {
                // TODO:     2. Change dY/X depending on where paddle is hit
                this.state.dx = -this.state.dx
                this.state.ballCollided = true
            }
        }

        if(this.state.ballY + this.state.dy > canvas.height-ballRadius || this.state.ballY + this.state.dy < ballRadius) {
            this.state.dy = -this.state.dy
            this.state.ballCollided = true
        }

        this.state.ballX += this.state.dx//+(10-this.state.gamePhase)
        this.state.ballY += this.state.dy//+(10-this.state.gamePhase)
    }

    start() {
        clearInterval(this.pauseInterval)
        this.running = true
        this.guestSocket.emit('game_started')
        this.hostSocket.emit('game_started')

        this.engineInterval = setInterval(() => {
            this.mutateState()
            this.hostSocket.emit('new_game_state', this.state)
            this.guestSocket.emit('new_game_state', this.state)
        }, 10)

        setTimeout(this.stop, 60000)
    }

    pause() {
        const pauseTime = 1500 // 1.5 sec pause
        this.stop()

        let progress = 0
        this.pauseInterval = setInterval(() => {
            if(progress < 101) {
                this.hostSocket.emit('pause_progress', progress)
                this.guestSocket.emit('pause_progress', progress)
                progress+= 10
            } else {
                this.start()
            }
        }, pauseTime / 10)
    }

    stop() {
        this.running = false
        clearInterval(this.engineInterval)
        clearInterval(this.pauseInterval)
    }

    updateScore() {
        this.hostSocket.emit('score_update', this.score)
        this.guestSocket.emit('score_update', this.score)
    }

    // When breaking bricks
    addScore(add, toHost) {
        if(toHost) {
            this.score.host += add
            // TODO: Add life if points enough
        } else {
            this.score.guest += add
            // TODO: Add life if points enough

        }
    }

    takeLife(toHost) {
        if(toHost) {
            if(--this.score.hostLives) {
                this.pause()
            } else {
                this.end(false)
            }
        } else {
            if(--this.score.guestLives) {
                this.pause()
            } else {
                this.end(true)
            }
        }
    }

    end(hostWon) {
        if(hostWon) {
            this.hostSocket.emit('game_ended', 'won')
            this.guestSocket.emit('game_ended', 'lost')
        } else {
            this.hostSocket.emit('game_ended', 'lost')
            this.guestSocket.emit('game_ended', 'won')
        }
        this.stop()
        delete this.allGames[this.hostSocket.id]
    }
}

// TODO: 2. Change dY depending on where paddle is hit
//       3. Spawn bricks


