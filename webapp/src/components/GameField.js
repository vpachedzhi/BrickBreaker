import React, {Component} from 'react'

export default class GameField extends Component {

    static propTypes = {

    }

    state = {

    }

    constructor(props) {
        super(props)
    }

    style = {
        container: {
            width: '100%',
            height: '80%'
        }
    }

    render() {
        const {container} = this.style
        return <div style={container}>
            <canvas ref="leftPad"/>
            <canvas ref="field"/>
            <canvas ref="rightPad"/>
        </div>
    }
}