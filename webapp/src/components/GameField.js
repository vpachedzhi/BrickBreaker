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
        const canvas = this.refs.field,
            ctx = canvas.getContext('2d')
        const ballRadius = 10
        let x = parseInt(this.styles.ballArea.width)/2,
            y = parseInt(this.styles.ballArea.height)-30,
            dx = 2,
            dy = -2
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
            <div className="GameContainer" style={container}>
                <canvas ref="leftPad" width={leftPad.width} height={leftPad.height}/>
                <canvas ref="field" width={ballArea.width} height={ballArea.height}/>
                {/*<canvas ref="rightPad"/>*/}
            </div>
        </div>
    }
}