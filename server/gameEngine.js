//@flow
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
} = require('./config')

const DELTA = 12
const ballDiameter = 2 * ballRadius

class GameEngine  {
    hostSocketId: string
    guestSocketId: string
    state: {
        ballX: number,
        ballY: number,
        dx: number,
        dy: number,
        hostY: number,
        guestY: number,
        ballCollided: boolean,
        bricks: Array<Array<Object>>
    }

    score: {
        host: number,
        hostLives: number,
        guest: number,
        guestLives: number
    }

    lastHit: string
    pauseInterval: any
    running: boolean
    engineInterval: any
    gamePhaseInterval: any
    gamePhase: number

    io: any
    onEnd: any

    constructor (hostSocketId: string, guestSocketId: string, io: any, onGameEnd: any) {
        this.hostSocketId = hostSocketId
        this.guestSocketId = guestSocketId
        this.io = io
        this.onEnd = onGameEnd

        let bricks = []
        for(let c=0; c<brickColumnCount; c++){
            bricks[c] = [];
            for(let r=0; r<brickRowCount; r++){
                bricks[c][r] = {
                    x: (c*(brickWidth  + brickPadding)) + brickOffsetLeft,
                    y: (r*(brickHeight + brickPadding)) + brickOffsetTop,
                    status: true//Math.random() >= 0.5
                }
            }
        }

        this.state = {
            ballX: canvas.width/2,
            ballY: canvas.height -ballRadius,
            dx: this.randomDX(), // TODO get out
            dy: DELTA, // TODO
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

        this.lastHit = ''

        this.pauseInterval = undefined

        this.running = false
        this.engineInterval = undefined
        this.gamePhaseInterval = undefined
        this.gamePhase = 0
    }

    processMouseInput(y: number, socketId: string) {
        if(socketId === this.hostSocketId) {
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
                this.state.ballX -= paddle.width
                this.takeLife(false)
            } else {
                this.state.dx = -this.state.dx
                this.state.dy = this.calcDeltaY(this.state.guestY)
                this.state.ballCollided = true
                this.lastHit = 'guest'
            }
        }
        else if(this.state.ballX + this.state.dx < ballRadius + paddle.width) { // HOST side/left

            if(this.state.ballY < this.state.hostY - paddle.height/2  // HOST miss
                || this.state.ballY > this.state.hostY + paddle.height/2) {
                this.state.dx = -this.state.dx
                this.state.ballCollided = true
                this.state.ballX += paddle.width
                this.takeLife(true)
            } else {
                this.state.dy = this.calcDeltaY(this.state.hostY)
                this.state.dx = -this.state.dx
                this.state.ballCollided = true
                this.lastHit = 'host'
            }
        }

        if(this.state.ballY + this.state.dy > canvas.height - ballRadius || this.state.ballY + this.state.dy < ballRadius) {
            this.state.dy = -this.state.dy
            this.state.ballCollided = true
        }
        let {bricks, ballX, ballY, dx, dy} = this.state
        for(let c=0; c < brickColumnCount; c++){
            for(let r=0; r < brickRowCount; r++){
                let b = bricks[c][r]
                if(b.status) {

                    if(ballX > b.x - ballRadius && ballX < b.x + brickWidth + ballRadius) {
                        if((b.y + brickHeight < ballY + ballRadius && ballY - ballRadius + dy < b.y + brickHeight) ||
                            (b.y > ballY + ballRadius && ballY + ballRadius + dy > b.y)){
                            this.state.dy = -dy
                            b.status = false
                            this.state.ballCollided = true
                            this.addScore(1, this.lastHit)
                        }

                    }

                    if(ballY > b.y - ballRadius && ballY < b.y + brickHeight + ballRadius) {
                        if((b.x + brickWidth < ballX + ballRadius && ballX - ballRadius + dx < b.x + brickWidth) ||
                            (b.x > ballX + ballRadius && ballX + ballRadius + dx > b.x)){
                            this.state.dx = -dx
                            b.status = false
                            this.state.ballCollided = true
                            this.addScore(1, this.lastHit)
                        }


                    }

                    // if(b.y - ballDiameter < ballY && ballY < b.y + brickHeight + ballDiameter){ // between the horizontal axes
                    //     if(ballX + ballRadius + dx > b.x || ballX - ballRadius + dx < b.x + brickWidth){
                    //         this.state.dx = -dx
                    //     }
                    // }
                    //
                    // if(b.x - ballDiameter < ballX && ballX < b.x + brickWidth + ballDiameter){ // between the vertical axes
                    //     if(ballY + ballRadius + dy > b.y || ballY - ballRadius + dy < b.y + brickHeight){
                    //         this.state.dy = -dy
                    //     }
                    // }
                }

            }
        }

        this.state.ballX += this.state.dx
        this.state.ballY += this.state.dy
    }

    start() {
        clearInterval(this.pauseInterval)
        this.running = true
        this.io.to(this.hostSocketId).emit('game_started')

        this.engineInterval = setInterval(() => {
            this.mutateState()
            this.io.to(this.hostSocketId).emit('new_game_state', this.state)
        }, 20)

        //this.startIncreasingPhase()
    }

    pause() {
        const pauseTime = 1500 // 1.5 sec pause
        this.stop()

        let progress = 0
        this.pauseInterval = setInterval(() => {
            if(progress < 101) {
                this.io.to(this.hostSocketId).emit('pause_progress', progress)
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
            this.state.dx > 0 ? this.state.dx+= DELTA/4 : this.state.dx-= DELTA/4
            this.state.dy > 0 ? this.state.dy+= DELTA/4 : this.state.dy-= DELTA/4
        }, 15000) // every 15sec game speeds up
    }

    randomDX() {
        const rand = Math.floor(Math.random() * 100)
        if(rand < 50) {
            return -DELTA
        } else {
            return DELTA
        }
    }

    emitScore() {
        this.io.to(this.hostSocketId).emit('score_update', this.score)
    }

    emitState() {
        this.io.to(this.hostSocketId).emit('new_game_state', this.state)
    }

    // Use only if paddle hits the ball
    calcDeltaY(playerY: number) {
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
    addScore(add: number, to: string) {
        if(to === 'host') {
            this.score.host += add
            if(this.score.host > 4) {
                this.score.hostLives++
                this.score.host = 0
            }
        } else if(to === 'guest'){
            this.score.guest += add
            if(this.score.guest > 4) {
                this.score.guestLives++
                this.score.guest = 0
            }
        }
        this.emitScore()
    }

    takeLife(toHost: boolean) {
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
        this.emitScore()
    }

    end(hostWon: boolean) {
        if(hostWon) {
            this.io.to(this.hostSocketId).emit('game_ended', this.hostSocketId)
        } else {
            this.io.to(this.hostSocketId).emit('game_ended', this.guestSocketId)
        }
        this.stop()
        this.onEnd(hostWon)
    }
}

module.exports = GameEngine