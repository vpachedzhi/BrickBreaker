//@flow
import React, {Component} from 'react'
import {hashHistory} from 'react-router'
import GameChat from './GameChat'
import GameField from "./GameField"
import ScoreBoard from './ScoreBoard'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import PauseProgress from './PauseProgress'
import socket from '../socket'
import {connect} from 'react-redux'
import type {Role} from "../reducers/actions"
type GameScreenProps = {
    user: {
        name: string,
        role: Role
    },
    info: {
        myName: string,
        otherName: string,
        myId: string,
        otherId: string
    },
    children: any
}
//$FlowFixMe
@connect(({user, info}) => ({
    user,
    info
}))
export default class GameScreen extends Component {

    props: GameScreenProps

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
        isHost: this.props.user ? (this.props.user.role === 'host') : ''
    }

    constructor(props: GameScreenProps) {
        super(props)
        if(this.state.isHost) {
            // socket.emit('create_game', {name: props.user.name})
            // socket.on('opponent_joined', data => {
            //     this.setState({
            //         opponent: data.name,
            //         opponentSocketId: data.socketGuestId,
            //         guestJoinedOpen: true
            //     })
            // })
        }
        else { // We are guest here
            // const [socketHostId, hostName] = this.props.params.role.split('~')
            // this.state.opponentSocketId = socketHostId
            // this.state.opponent = hostName
            // socket.emit('join_game', {socketHostId, name: this.props.user.name})
        }

        socket.on('opponent_left', () => {
            this.setState({opponentLeft: true})
        })

        socket.on('message_sent', this.onReceiveMessage)

        socket.on('game_started', () => {
            this.setState({running: true, pauseProgress: -1})
        })

        socket.on('pause_progress', pauseProgress => {
            this.setState({running: false, pauseProgress})
        })

        socket.on('game_ended', winnerId => {
            if(socket.id === winnerId) {
                this.setState({gameStatus: 'won'})
            } else {
                this.setState({gameStatus: 'lost'})
            }
        })
    }

    onSendMessage = (message: string) => {
        if(message === 'START' && this.state.isHost){
            socket.emit('start_game')
        }
        else {
            socket.emit('message_sent', {message, opponentSocketId: this.props.info.otherId})
        }
    }

    onReceiveMessage = (msg: string) => {
        this.setState({newMessage: msg})
        this.setState({newMessage: ''})
    }

    onGameEnd = () => {
        hashHistory.push(`/`)
        socket.emit('request_update');
    }

    onMouseMove = (e: any) => {
        if (this.state.running) {
            socket.emit('mouse_move', {
                y: e.clientY,
                hostName: this.state.isHost ? this.props.info.myName : this.props.info.otherName
            })
        }
    }

    componentWillUnmount() {
        socket.off('message_sent')
        socket.off('opponent_left')
        socket.off('opponent_joined')
        socket.off('game_started')
        socket.off('pause_progress')
        socket.off('game_ended')
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
        return this.props.user && <div className="GameScreen">
            <GameField opponentY={this.state.opponentY}
                       isHost={this.state.isHost}
                       opponentSocketId={this.state.opponentSocketId}
                       socket={socket}
                       onMouseMove={this.onMouseMove}
            />
            <div className="row BottomPanel">
                <div className="ScoreBoard col-md-4 col-sm-4 col-lg-4">
                    <ScoreBoard myName={this.props.info.myName}
                                otherName={this.props.info.otherName}
                                socket={socket}
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
                autoFocus
                modal={false}
                open={this.state.guestJoinedOpen}
            >
                You are the host.
                You can can start the game whenever you want by typing "START" in the chat.
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