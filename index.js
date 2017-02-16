const {
    canvas,
    ballRadius,
    paddle,
    brickRowCount,
    brickColumnCount,
    brickWidth,
    brickHeight,
    brickPadding,
    brickOffsetTop,
    brickOffsetLeft
} = require('./webapp/config')

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
                game.stop()
                delete games[socket.id]
            } else {
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

const DELTA = 12

class GameEngine  {
    constructor (hostName, socket, allGames) {
        this.allGames = allGames
        this.hostName = hostName
        this.hostSocket = socket
        this.guestName = ''
        this.guestSocket = undefined


        let bricks = []
        for(let c=0; c<brickColumnCount; c++){
            bricks[c] = [];
            for(let r=0; r<brickRowCount; r++){
                bricks[c][r] = {
                    x: (c*(brickWidth  + brickPadding)) + brickOffsetLeft,
                    y: (r*(brickHeight + brickPadding)) + brickOffsetTop,
                    status: Math.random() >= 0.5
                }
            }
        }
        this.state = {
            ballX: canvas.width/2,
            ballY: canvas.height/2 -ballRadius,
            dx: DELTA, // TODO get out
            dy: 0, // TODO
            hostY: canvas.height/2,
            guestY: canvas.height/2,
            ballCollided: false,
            bricks
        }

        this.score = {
            host: 0,
            hostLives: 5, // TODO : lives   constant
            guest: 0,
            guestLives: 5
        }

        this.pauseInterval = undefined

        this.running = false
        this.engineInterval = undefined
        this.gamePhaseInterval = undefined
        this.gamePhase = 0
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
                this.state.dx = -this.state.dx
                this.state.ballCollided = true
                this.takeLife()
                this.updateScore()
            } else {
                this.state.dx = -this.state.dx
                this.state.dy = this.calcDeltaY(this.state.guestY)
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
                this.state.dy = this.calcDeltaY(this.state.hostY)
                this.state.dx = -this.state.dx
                this.state.ballCollided = true
            }
        }

        if(this.state.ballY + this.state.dy > canvas.height-ballRadius || this.state.ballY + this.state.dy < ballRadius) {
            this.state.dy = -this.state.dy
            this.state.ballCollided = true
        }

        let {bricks, ballX, ballY, dx, dy} = this.state
        for(let c=0; c<brickColumnCount; c++){
            for(let r=0; r<brickRowCount; r++){
                let b = bricks[c][r]
                if(b.status) {

                    if(ballX > b.x - ballRadius && ballX < b.x + brickWidth + ballRadius) {
                        if((b.y + brickHeight < ballY - ballRadius && ballY - ballRadius + dy < b.y + brickHeight) ||
                            (b.y > ballY + ballRadius && ballY + ballRadius + dy > b.y)){
                            this.state.dy = -dy
                            b.status = false
                            this.state.ballCollided = true
                        }



                    }

                    if(ballY > b.y - ballRadius && ballY < b.y + brickHeight + ballRadius) {
                        if((b.x + brickWidth < ballX + ballRadius && ballX - ballRadius + dx < b.x + brickWidth) ||
                            (b.x > ballX + ballRadius && ballX + ballRadius + dx > b.x)){
                            this.state.dx = -dx
                            b.status = false
                            this.state.ballCollided = true
                        }


                    }

                }

            }
        }

        this.state.ballX += this.state.dx
        this.state.ballY += this.state.dy
    }

    start() {
        this.setRandomDX()
        clearInterval(this.pauseInterval)
        this.running = true
        this.guestSocket.emit('game_started')
        this.hostSocket.emit('game_started')

        this.engineInterval = setInterval(() => {
            this.mutateState()
            this.hostSocket.emit('new_game_state', this.state)
            this.guestSocket.emit('new_game_state', this.state)
        }, 20)

        this.startIncreasingPhase()
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
        clearInterval(this.gamePhaseInterval)
    }

    startIncreasingPhase() {
        this.gamePhaseInterval = setInterval(() => {
            this.state.dx > 0 ? this.state.dx++ : this.state.dx--
            this.state.dy > 0 ? this.state.dy++ : this.state.dy--
        }, 6000) // every 30sec game speeds up
    }

    setRandomDX() {
        const rand = Math.floor(Math.random() * 100)
        if(rand < 50) {
            this.state.dx = -DELTA
        } else {
            this.state.dx = DELTA
        }
    }

    updateScore() {
        this.hostSocket.emit('score_update', this.score)
        this.guestSocket.emit('score_update', this.score)
    }

    // Use only if paddle hits the ball
    calcDeltaY(playerY) {
        const ballY = this.state.ballY
        const dx = this.state.dx
        const dy = this.state.dy
        let nextDY = Math.abs(dy)
        if(playerY > ballY) {
            if(dy > 0) {
                nextDY -= DELTA + this.gamePhase
            } else {
                nextDY += (DELTA / 2)
            }
        } else if(playerY < ballY) {
            if(dy < 0) {
                nextDY -= DELTA
            } else{
                nextDY += (DELTA / 2)
            }
        } else {
            return dy
        }

        if(nextDY > Math.abs(dx)) {
            nextDY = Math.abs(dx)
        }

        if(dy < 0) {
            nextDY = -nextDY
        }

        return nextDY
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

