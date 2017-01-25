import React, {Component} from 'react'

export default class GameScreen extends Component {

    constructor(props) {
        super(props)
        this.socket = io()
        this.socket.emit('create_game', {name: props.params.name})
        this.socket.on('new_game', (roomId) => {
            console.log('you were joined to ' + roomId)
        })
        this.socket.on('user_joined', (userName) => {
            console.log(userName + ' has joined your room')
        })
    }

    render() {
        return <div>Heloo maika</div>
    }
}