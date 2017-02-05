import React, {Component} from 'react'
import {canvas, ballRadius, paddle} from '../../config'
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

        this.gameState = {
            ballX: canvas.width/2,
            ballY: canvas.height-ballRadius,
            hostY: canvas.height/2,
            guestY: canvas.height/2,

        }

        this.draw()
        this.props.socket.on('opponent_moved', ({y}) => {
            this.opponentY = y
        })

        this.props.socket.on('new_game_state', newState => {
            this.gameState = newState
        })

    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    draw = () => {
        const canvasRef = this.refs.canvas,
            ctx = canvasRef.getContext('2d'),
            {ballX, ballY, hostY, guestY} = this.gameState
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
            }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBall()
        drawRightPaddle()
        drawLeftPaddle()
    }

    handleMouseMove = (e) => {
        if (this.props.running) {
            this.props.socket.emit('mouse_move', {
                y: e.clientY,
                hostSocketId: this.props.isHost ? this.props.socket.id : this.props.opponentSocketId
            })
        }
    }


    render() {
        return <div className="GameField" >
            <div className="GameContainer"
                 ref="gameContainer"
                 onMouseMove={this.handleMouseMove}>
                <canvas ref="canvas" width={canvas.width} height={canvas.height} tabIndex="1"/>
            </div>
        </div>
    }
}