import React, {Component} from 'react'
import {hashHistory} from 'react-router'
import GameChat from './GameChat'
import GameField from "./GameField"
import ScoreBoard from './ScoreBoard'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RefreshIndicator from 'material-ui/RefreshIndicator'

export default class GameScreen extends Component {

    static propTypes = {
        socket: React.PropTypes.any
    }

    state = {
        opponentSocketId: '',
        opponent: '',
        newMessage: '',
        guestJoinedOpen: false,
        opponentLeft: false,
        opponentY: 300,
        running: false
    }

    constructor(props) {
        super(props)
        if(this.props.params.role === 'host') {
            this.props.socket.emit('create_game', {name: props.params.name})
            console.log(this.props.socket.id)
            this.props.socket.on('opponent_joined', data => {
                this.setState({
                    opponent: data.name,
                    opponentSocketId: data.socketGuestId,
                    guestJoinedOpen: true
                })
            })
        }
        else { // We are guest here
            const [socketHostId, hostName] = this.props.params.role.split('~')
            this.state.opponentSocketId = socketHostId
            this.state.opponent = hostName
            this.props.socket.emit('join_game', {socketHostId, name: this.props.params.name})
        }

        this.props.socket.on('opponent_left', () => {
            this.setState({opponentLeft: true})
        })

        this.props.socket.on('message_sent', this.onReceiveMessage)

        this.props.socket.on('game_started', () => {
            this.setState({running: true})
        })

    }

    onSendMessage = (message) => {
        console.log(`You sent: ${message}`)
        if(message === 'START' && this.state.opponent){
            this.props.socket.emit('start_game', {roomId: this.state.roomId})
        }
        else {
            this.props.socket.emit('message_sent', {message, opponentSocketId: this.state.opponentSocketId})
        }
    }

    onReceiveMessage = (msg) => {
        this.setState({newMessage: msg})
    }

    onOpponentLeft = () => {
        hashHistory.push(`/`)
    }

    render() {
        const confirmGuestJoined = <FlatButton
            label="Ok"
            primary={true}
            onClick={() => this.setState({guestJoinedOpen: false})}
        />
        const action = <FlatButton
            label="Go to start screen"
            primary={true}
            onTouchTap={this.onOpponentLeft}
        />
        return <div className="GameScreen" onKeyPress={e => {
            if(e.key === ' ' && this.props.params.role === 'host' && this.state.opponentSocketId){
                this.props.socket.emit('start_game', {opponentSocketId: this.state.opponentSocketId})
            }
        }}>
            <GameField running={this.state.running}
                       opponentY={this.state.opponentY}
                       isHost={this.props.params.role === 'host'}
                       opponentSocketId={this.state.opponentSocketId}
                       socket={this.props.socket}
            />
            <div className="row BottomPanel">
                <div className="ScoreBoard col-md-4 col-sm-4 col-lg-4">
                    <ScoreBoard myName={this.props.params.name} myScore={0}
                                otherName={this.state.opponent} otherScore={0}>
                        {this.props.children}
                    </ScoreBoard>
                </div>
                <div className="GameChat col-md-8 col-md-8 col-sm-8">
                    <GameChat onSendMessage={this.onSendMessage}
                              newMessage={this.state.newMessage}/>
                </div>
            </div>
            <Dialog
                title={`${this.state.opponent} joined you`}
                actions={confirmGuestJoined}
                modal={false}
                open={this.state.guestJoinedOpen}
            >
                You are the host.
                You can can start the game whenever you want by the start button.
                Good luck !!!
            </Dialog>
            <Dialog
                actions={[action]}
                modal={false}
                open={this.state.opponentLeft}
                onRequestClose={this.onOpponentLeft}
            >
                {this.state.opponent} left the game!
            </Dialog>
        </div>
    }
}