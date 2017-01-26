import React, {Component} from 'react'
import GameChat from './GameChat'

export default class GameScreen extends Component {

    static propTypes = {
        socket: React.PropTypes.any
    }

    constructor(props) {
        super(props)
        if(this.props.params.role === 'host') {
            this.props.socket.emit('create_game', {name: props.params.name})
            this.props.socket.on('new_game', (roomId) => {
                console.log('you created ' + roomId)
            })
            this.props.socket.on('user_joined', (userName) => {
                console.log(userName + ' has joined your room')
            })
        } else {
            this.props.socket.emit('join_game', {roomId: this.props.params.roomId, name: this.props.params.name})
            console.log(this.props.params.name + ', you joined ' + this.props.params.roomId)
        }
    }

    render() {
        return <div><GameChat/></div>
    }
}