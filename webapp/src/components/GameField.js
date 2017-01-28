import React, {Component} from 'react'

export default class GameField extends Component {

    static propTypes = {

    }

    state = {

    }

    constructor(props) {
        super(props)
    }

    styles = {
        container: {
            width: '1100px',
            height: '650px'
        }
    }

    render() {
        const {container} = this.styles
        return <div className="GameField">
            <div className="GameContainer" style={this.styles.container}>
                {/*<canvas ref="leftPad"/>*/}
                <canvas ref="field" />
                {/*<canvas ref="rightPad"/>*/}
            </div>
        </div>
    }
}