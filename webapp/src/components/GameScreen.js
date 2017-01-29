import React, {Component} from 'react'
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
        hostModalOpen: false,
        guestModalOpen: false
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
            this.state.guestModalOpen = true
        }
        this.props.socket.on('send_to_room', this.onReceiveMessage.bind(this))
        this.props.socket.on('opponent_joined', (userName) => {
            console.log(`Your opponent is ${userName}`)
            this.setState({opponent: userName})
            if(this.props.params.role === 'host')
                this.setState({hostModalOpen: true})
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
        const actions = [
            <FlatButton
                label="Start game"
                primary={true}
                onTouchTap={()=>{}}
            />,
        ];
        return <div className="GameScreen">
            <GameField running={false}/>
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
                title={`${this.state.opponent} want to play with you`}
                actions={actions}
                modal={false}
                open={this.state.hostModalOpen}
            >
                You are the host.
                You can can start the game whenever you want.
                Good luck !!!
            </Dialog>
            <Dialog
                title={`Please wait until ${this.state.opponent} start the game`}
                actions={actions}
                modal={false}
                open={this.state.guestModalOpen}
            >
                <RefreshIndicator
                    size={50}
                    left={50}
                    top={50}
                    status="loading"
                />
            </Dialog>
        </div>
    }
}