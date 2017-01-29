import React, {Component} from 'react'
import GameChat from './GameChat'
import GameField from "./GameField"
import ScoreBoard from './ScoreBoard'

export default class GameScreen extends Component {

    static propTypes = {
        socket: React.PropTypes.any
    }

    state = {
        roomId: '',
        newMessage: {},
        opponent: ''
    }

    constructor(props) {
        super(props)
        if(this.props.params.role === 'host') {
            this.props.socket.emit('create_game', {name: props.params.name})
            this.props.socket.on('new_game_created', (roomId) => {
                console.log('you created ' + roomId)
                this.setState({roomId})
            })
            this.props.socket.on('disconnect', () => {
                this.props.socket.emit('host_disconnected', this.state.roomId)
            })
        } else {
            const {roomId, name} = this.props.params
            this.props.socket.emit('join_game', {roomId, name})
            console.log(name + ', you joined ' + roomId)
            this.state.roomId = roomId
        }
        this.props.socket.on('send_to_room', this.onReceiveMessage.bind(this))
        this.props.socket.on('opponent_joined', (userName) => {
            console.log('Your opponent is ${username}')
            this.setState({opponent: userName})
        })
    }

    onSendMessage = (message) => {
        console.log(`You sent: ${message}`)
        this.props.socket.emit('message_sent', {message, author: this.props.params.name, roomId: this.state.roomId})
    }

    onReceiveMessage = (data) => {
        this.setState({newMessage: data})
    }

    render() {
        return <div className="GameScreen">
            <GameField running={false}/>

            <div className="row BottomPanel">
                <div className="ScoreBoard col-md-4 col-sm-4 col-lg-4">
                    <ScoreBoard myName={this.props.params.name} myScore={0}
                    otherName={this.state.opponent} otherScore={0}/>
                </div>
                <div className="GameChat col-md-8 col-md-8 col-sm-8">
                    <GameChat onSendMessage={this.onSendMessage}
                              newMessage={this.state.newMessage}
                              name={this.props.params.name}/>
                </div>
            </div>
        </div>
    }
}