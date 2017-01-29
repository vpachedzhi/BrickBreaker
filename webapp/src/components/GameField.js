import React, {Component} from 'react'
import ee from '../utils/eventEmitter'

export default class GameField extends Component {

    static propTypes = {
        running: React.PropTypes.bool.isRequired
    }

    componentWillReceiveProps(newProps) {
        if(newProps.running) {
            this.interval = setInterval(this.draw, 10)
        }
        else
            clearInterval(this.interval)

    }

    componentDidMount() {
        // this.refs.canvas.height = this.refs.gameContainer.clientHeight
        // this.refs.canvas.width = this.refs.gameContainer.clientWidth
        const canvas = this.refs.canvas
        this.ballRadius = canvas.width/120
        this.paddleWidth = this.ballRadius*2
        this.paddleHeight = canvas.height/3
        this.mouseY = canvas.height/3+(this.paddleHeight/2)
        this.ballX = canvas.width/2
        this.ballY = canvas.height-this.ballRadius
        this.dx = 7
        this.dy = -this.dx
        console.log(canvas.width, canvas.height)
        this.draw()
    }

    draw = () => {
        const canvas = this.refs.canvas,
            ctx = canvas.getContext('2d'),
            {ballRadius,paddleWidth, paddleHeight, ballX, ballY, dx, dy} = this
        const drawBall = () => {
                ctx.beginPath();
                ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            },
            drawRightPaddle = () => {
                ctx.beginPath();
                ctx.rect(canvas.width-paddleWidth, this.mouseY-(paddleHeight/2), paddleWidth, paddleHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            },
            drawLeftPaddle = () => {
                ctx.beginPath();
                ctx.rect(0, this.mouseY-(paddleHeight/2), paddleWidth, paddleHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBall()
        drawRightPaddle()
        drawLeftPaddle()

        if(ballX + dx > canvas.width-ballRadius || ballX + dx < ballRadius) {
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


    render() {
        return <div className="GameField" >
            <div className="GameContainer"
                 ref="gameContainer"
                 onMouseMove={e => this.mouseY = e.clientY}>
                <canvas ref="canvas" width={1200} height={600} onKeyPress={e => {
                    switch (e.key) {
                        case ' sfdsf':
                            if(this.state.paused){
                                this.interval = setInterval(this.draw, 10)
                                this.setState({paused: false})
                            }
                            else {
                                clearInterval(this.interval)
                                this.setState({paused: true})
                            }
                            break
                        default:
                            break
                    }
                }} tabIndex="1"/>
            </div>
        </div>
    }
}