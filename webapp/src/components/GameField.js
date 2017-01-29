import React, {Component} from 'react'

export default class GameField extends Component {

    static propTypes = {

    }

    state = {

    }

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.refs.canvas.height = this.refs.gameContainer.clientHeight
        this.refs.canvas.width = this.refs.gameContainer.clientWidth
        this.startDraw()
    }

    dimensions = {
        width: '1100px',
        height: '600px',
    }

    styles = {

        container: {
            width: this.dimensions.width,
            height: this.dimensions.height,
        },
        leftPad: {
            width: '50px',
            height: this.dimensions.height,
        },
        ballArea: {
            width: '1000px',
            height: this.dimensions.height,
        }

    }

    startDraw = () => {
        const canvas = this.refs.canvas,
            ctx = canvas.getContext('2d')
        const ballRadius = 10
        let x = canvas.width/2,
            y = canvas.height-30,
            dx = 10,
            dy = -dx
        const drawBall = () => {
                ctx.beginPath();
                ctx.arc(x, y, ballRadius, 0, Math.PI*2);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            },
            draw = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBall();

                if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
                    dx = -dx;
                }
                if(y + dy > canvas.height-ballRadius || y + dy < ballRadius) {
                    dy = -dy;
                }

                x += dx;
                y += dy;
            }
        setInterval(draw, 10);
    }

    render() {
        const {container, leftPad, ballArea} = this.styles
        return <div className="GameField">
            <div className="GameContainer"
                 ref="gameContainer"
                 onMouseMove={e => console.log(e.clientY)}>
                {/*<canvas ref="leftPad" width={leftPad.width} height={leftPad.height}/>*/}
                <canvas ref="canvas"/>
                {/*<canvas ref="rightPad"/>*/}
            </div>
        </div>
    }
}