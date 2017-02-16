import React, {Component} from 'react'
import {
    canvas,
    ballRadius,
    paddle,
    brickRowCount,
    brickColumnCount,
    brickWidth,
    brickHeight
} from '../../config'
import ee from '../utils/eventEmitter'
export default class GameField extends Component {

    static propTypes = {
        running: React.PropTypes.bool.isRequired,
        isHost: React.PropTypes.bool.isRequired,
        socket: React.PropTypes.object.isRequired,
        onMouseMove: React.PropTypes.func.isRequired
    }

    componentWillReceiveProps(newProps) {
        if(newProps.running) {
            clearInterval(this.interval)
            this.interval = setInterval(this.draw, 20)
        }
        else {
            clearInterval(this.interval)
        }
    }

    componentDidMount() {

        this.gameState = {
            ballX: canvas.width/2,
            ballY: canvas.height-ballRadius,
            hostY: canvas.height/2,
            guestY: canvas.height/2
        }

        this.draw()

        this.props.socket.on('new_game_state', newState => {
            this.gameState = newState

            if (newState.ballCollided) {
                ee.emit('BALL_HIT')
            }
        })

    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    draw = () => {
        const canvasRef = this.refs.canvas,
            ctx = canvasRef.getContext('2d'),
            {ballX, ballY, hostY, guestY, bricks} = this.gameState
        const drawBall = () => {
                ctx.beginPath();
                ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            },
            drawRightPaddle = () => {
                ctx.beginPath();
                ctx.rect(canvas.width-paddle.width, guestY-(paddle.height/2), paddle.width, paddle.height);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            },
            drawLeftPaddle = () => {
                ctx.beginPath();
                ctx.rect(0, hostY-(paddle.height/2), paddle.width, paddle.height);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            },
            drawBricks = () => {
                if(bricks){
                    for(let c=0; c<brickColumnCount; c++) {
                        for(let r=0; r<brickRowCount; r++) {
                            const brick = bricks[c][r]
                            if(brick.status) {
                                ctx.beginPath();
                                ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
                                ctx.fillStyle = "#0095DD";
                                ctx.fill();
                                ctx.closePath();
                            }
                        }
                    }
                }
                //console.log(this.gameState)
            }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBall()
        drawRightPaddle()
        drawLeftPaddle()
        drawBricks()
    }

    render() {
        return <div className="GameField" >
            <div className="GameContainer"
                 ref="gameContainer"
                 onMouseMove={this.props.onMouseMove}>
                <canvas ref="canvas" width={canvas.width} height={canvas.height} tabIndex="1"/>
            </div>
        </div>
    }
}