import React, {Component} from 'react'
import {hashHistory} from 'react-router'
import GameChat from './GameChat'
import GameField from "./GameField"
import ScoreBoard from './ScoreBoard'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import ee from '../utils/eventEmitter'

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
        running: false,
        isHost: this.props.params.role === 'host'
    }

    constructor(props) {
        super(props)
        if(this.state.isHost) {
            this.props.socket.emit('create_game', {name: props.params.name})
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

        ee.on('BALL_MISS', this.onBallMissed)

    }

    onSendMessage = (message) => {
        if(message === 'START' && this.state.isHost && this.state.opponent){
            this.props.socket.emit('start_game', {opponentSocketId: this.state.opponentSocketId})
        }
        else {
            this.props.socket.emit('message_sent', {message, opponentSocketId: this.state.opponentSocketId})
        }
    }

    onReceiveMessage = (msg) => {
        this.setState({newMessage: msg})
        this.setState({newMessage: ''})
    }

    onOpponentLeft = () => {
        hashHistory.push(`/`)
        this.props.socket.emit('request_update');
    }

    onBallMissed = () => {
        this.props.socket.emit('ball_missed', {
            hostSocketId: this.state.isHost ? this.props.socket.id : this.state.opponentSocketId
        })
    }

    componentWillUnmount() {
        this.props.socket.off('message_sent')
        this.props.socket.off('opponent_left')
        this.props.socket.off('opponent_joined')
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
        return <div className="GameScreen">
            <GameField running={this.state.running}
                       opponentY={this.state.opponentY}
                       isHost={this.state.isHost}
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