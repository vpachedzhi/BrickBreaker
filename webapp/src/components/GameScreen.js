import React, {Component} from 'react'

export default class GameScreen extends Component {

    static propTypes = {
        socket: React.PropTypes.any
    }

    constructor(props) {
        super(props)
        this.props.socket.emit('create_game', {name: props.params.name})
        this.props.socket.on('new_game', (roomId) => {
            console.log('you were joined to ' + roomId)
        })
        this.props.socket.on('user_joined', (userName) => {
            console.log(userName + ' has joined your room')
        })
    }

    render() {
        return <div>Heloo maika</div>
    }
}