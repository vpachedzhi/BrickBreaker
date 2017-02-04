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
        roomId: '',
        newMessage: {},
        opponent: '',
        guestJoinedOpen: false,
        opponentLeft: false,
        opponentY: 300,
        running: false
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
        }
        else { // We are guest here
            const {roomId, name} = this.props.params
            this.props.socket.emit('join_game', {roomId, name})
            console.log(name + ', you joined ' + roomId)
            this.state.roomId = roomId
        }

        this.props.socket.on('send_to_room', this.onReceiveMessage.bind(this))

        this.props.socket.on('opponent_joined', (userName) => {
            console.log(`Your opponent is ${userName}`)
            this.setState({opponent: userName})
            if(this.props.params.role === 'host')
                this.setState({guestJoinedOpen: true})
        })

        this.props.socket.on('opponent_left', () => {
            this.setState({opponentLeft: true})
        })

        this.props.socket.on('game_started', () => {
            this.setState({running: true, hostModalOpen: false, guestModalOpen: false})
        })

        this.props.socket.on('opponent_moved', (y) => {
            this.setState({opponentY: y})
            console.log("OpponentY: " + y)
        })
    }

    onSendMessage = (message) => {
        console.log(`You sent: ${message}`)
        if(message === 'START' && this.state.opponent){
            this.props.socket.emit('start_game', {roomId: this.state.roomId})
        }
        else
            this.props.socket.emit('message_sent', {message, author: this.props.params.name, roomId: this.state.roomId})
    }

    onReceiveMessage = (data) => {
        this.setState({newMessage: data})
    }

    onOpponentLeft = () => {
        hashHistory.push(`/`)
        // if(this.props.params.role === 'guest' || this.state.isRunning) {
        //     hashHistory.push(`/`)
        // }
    }

    onMouseMove = (y) => {
        this.props.socket.emit('mouse_move', {
            role: this.props.params.role,
            roomId: this.props.params.roomId,
            y
        })
        console.log("MY: " + y)
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
                       isHost={this.props.params.role === 'host'}
                       onMouseMove={this.onMouseMove}
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
                              newMessage={this.state.newMessage}
                              name={this.props.params.name}/>
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