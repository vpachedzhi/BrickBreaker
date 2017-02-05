import React, {Component} from 'react'
import ee from '../utils/eventEmitter'

export default class GameField extends Component {

    static propTypes = {
        running: React.PropTypes.bool.isRequired,
        isHost: React.PropTypes.bool.isRequired,
        socket: React.PropTypes.object.isRequired,
        opponentSocketId: React.PropTypes.string.isRequired
    }

    componentWillReceiveProps(newProps) {
        if(newProps.running) {
            clearInterval(this.interval)
            this.interval = setInterval(this.draw, 10)
        }
        else {
            clearInterval(this.interval)
        }
    }

    componentDidMount() {

        const canvas = this.refs.canvas
        this.ballRadius = canvas.width/120
        this.paddleWidth = this.ballRadius*2
        this.paddleHeight = canvas.height/3
        this.mouseY = canvas.height/3+(this.paddleHeight/2)
        this.opponentY = 300
        this.ballX = canvas.width/2
        this.ballY = canvas.height-this.ballRadius
        this.dx = 7
        this.dy = -this.dx
        this.draw()
        this.props.socket.on('opponent_moved', ({y}) => {
            this.opponentY = y
        })

    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    draw = () => {
        const canvas = this.refs.canvas,
            ctx = canvas.getContext('2d'),
            {ballRadius, paddleWidth, paddleHeight, ballX, ballY, dx, dy, mouseY, opponentY} = this
        const drawBall = () => {
                ctx.beginPath();
                ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            },
            drawRightPaddle = () => {
                ctx.beginPath();
                ctx.rect(canvas.width-paddleWidth, (this.props.isHost ? opponentY : mouseY)-(paddleHeight/2), paddleWidth, paddleHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            },
            drawLeftPaddle = () => {
                ctx.beginPath();
                ctx.rect(0, (this.props.isHost ? mouseY :opponentY)-(paddleHeight/2), paddleWidth, paddleHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBall()
        drawRightPaddle()
        drawLeftPaddle()

        if(ballX + dx > canvas.width-ballRadius - paddleWidth) { // When ball is on the right side
            if(!this.props.isHost && (ballY < mouseY - paddleHeight/2 || ballY > mouseY + paddleHeight/2)) {
                ee.emit('BALL_MISS')
            }
            this.dx = -dx;
            ee.emit('BALL_HIT')
        } else if(ballX + dx < ballRadius + paddleWidth) { // When ball is on the left side
            if(this.props.isHost && (ballY < mouseY - paddleHeight/2 || ballY > mouseY + paddleHeight/2)) {
                ee.emit('BALL_MISS')
            }
            this.dx = -dx;
            ee.emit('BALL_HIT')
        }

        if(ballY + dy > canvas.height-ballRadius || ballY + dy < ballRadius) {
            this.dy = -dy;
            ee.emit('BALL_HIT')
        }

        this.ballX += dx;
        this.ballY += dy;
    }

    handleMouseMove = (e) => {
        this.mouseY = e.clientY
        //this.props.onMouseMove(this.mouseY)
        this.props.socket.emit('mouse_move', {y: this.mouseY, opponentSocketId: this.props.opponentSocketId})
    }


    render() {
        return <div className="GameField" >
            <div className="GameContainer"
                 ref="gameContainer"
                 onMouseMove={this.handleMouseMove}>
                <canvas ref="canvas" width={1200} height={600} tabIndex="1"/>
            </div>
        </div>
    }
}