import React, {Component} from 'react'
import {hashHistory} from 'react-router'
import GameChat from './GameChat'
import GameField from "./GameField"
import ScoreBoard from './ScoreBoard'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import PauseProgress from './PauseProgress'

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
        gameStatus: '',
        pauseProgress: -1,
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
            this.setState({running: true, pauseProgress: -1})
        })

        this.props.socket.on('pause_progress', pauseProgress => {
            this.setState({running: false, pauseProgress})
        })

        this.props.socket.on('game_ended', gameStatus => {
            this.setState({gameStatus})
        })
    }

    onSendMessage = (message) => {
        if(message === 'START' && this.state.isHost && this.state.opponent){
            this.props.socket.emit('start_game')
        }
        else {
            this.props.socket.emit('message_sent', {message, opponentSocketId: this.state.opponentSocketId})
        }
    }

    onReceiveMessage = (msg) => {
        this.setState({newMessage: msg})
        this.setState({newMessage: ''})
    }

    onGameEnd = () => {
        hashHistory.push(`/`)
        this.props.socket.emit('request_update');
    }

    onMouseMove = (e) => {
        if (this.state.running) {
            this.props.socket.emit('mouse_move', {
                y: e.clientY,
                hostSocketId: this.state.isHost ? this.props.socket.id : this.state.opponentSocketId
            })
        }
    }

    componentWillUnmount() {
        this.props.socket.off('message_sent')
        this.props.socket.off('opponent_left')
        this.props.socket.off('opponent_joined')
        this.props.socket.off('game_started')
        this.props.socket.off('pause_progress')
        this.props.socket.off('game_ended')
    }

    render() {
        const confirmGuestJoined = <FlatButton
            autoFocus
            label="Ok"
            primary={true}
            onClick={() => this.setState({guestJoinedOpen: false})}
        />
        const action = <FlatButton
            label="Go to start screen"
            primary={true}
            onTouchTap={this.onGameEnd}
        />
        return <div className="GameScreen">
            <GameField running={this.state.running}
                       opponentY={this.state.opponentY}
                       isHost={this.state.isHost}
                       opponentSocketId={this.state.opponentSocketId}
                       socket={this.props.socket}
                       onMouseMove={this.onMouseMove}
            />
            <div className="row BottomPanel">
                <div className="ScoreBoard col-md-4 col-sm-4 col-lg-4">
                    <ScoreBoard myName={this.props.params.name}
                                otherName={this.state.opponent}
                                socket={this.props.socket}
                                isHost={this.state.isHost}>
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
                You can can start the game whenever you want by writing "START" in the chat.
                Good luck !!!
            </Dialog>
            <Dialog
                actions={[action]}
                modal={false}
                open={this.state.opponentLeft}
                onRequestClose={this.onGameEnd}
            >
                {this.state.opponent} left the game!
            </Dialog>
            <Dialog
                open={this.state.gameStatus !== ''}
                onRequestClose={this.onGameEnd}
                modal={false}
            >
                {this.state.gameStatus === 'won' ? 'Congrats! You won!' : 'You lost... Better luck next time.'}
            </Dialog>
            <PauseProgress pauseProgress={this.state.pauseProgress}/>
        </div>
    }
}