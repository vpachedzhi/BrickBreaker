import React, {Component} from 'react'
import {hashHistory} from 'react-router'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import {List, ListItem} from 'material-ui/List'
import AvPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline'
import IconButton from 'material-ui/IconButton'

import socket from '../socket'

export default class StartScreen extends Component {
    state = {
        username: '',
        roomId: '',
        roomsList: [],
        errorText: '',
        running: false
    }

    static propTypes = {
        socket: React.PropTypes.any
    }

    constructor(props) {
        super(props)
        socket.on('rooms_list_update', (roomsList) => {
            this.setState({roomsList})
        })
    }

    onCreateGame = () => {
        if(this.state.username) {
            socket.off('rooms_list_update')
            hashHistory.push(`/game/${this.state.username}/host`)
        } else {
            this.displayErrorText();
        }
    }

    onJoinGame = (game) => {
        if(this.state.username) {
            socket.off('rooms_list_update')
            hashHistory.push(`/game/${this.state.username}/${game.socketHostId}~${game.hostName}`)
        } else {
            this.displayErrorText();
        }
    }

    displayErrorText() {
        this.setState({errorText: "Please enter your name first"})
    }

    onTextChange(text) {
        this.setState({username: text, errorText: ''})
    }

    render() {
        return <Paper className="StartScreen">
            <div className="row center-md center-sm center-xs" style={{height: '10%'}}>
                <div className="col-sm-8 col-md-4">
                    <div className="row">
                        <div className="col-md-6">
                            <TextField
                                autoFocus
                                hintText="Enter username"
                                maxLength="12"
                                value={this.state.username}
                                onChange={(e) => this.onTextChange(e.target.value)}
                                errorText={this.state.errorText}
                                fullWidth={true}
                                onKeyPress={(e)=>  {
                                   if (e.key === 'Enter')
                                       this.onCreateGame()
                                }}
                            />
                        </div>
                        <div className="col-md-6">
                            <RaisedButton label="Create game"
                                          primary={true}
                                          disabled={!this.state.username}
                                          onClick={this.onCreateGame}
                                          fullWidth={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row center-md center-sm center-xs" style={{height: '80%'}}>
                <div className="GamesList col-sm-8 col-md-4">
                    <List>
                        {this.state.roomsList.map((game, i) => {
                            return <ListItem key={i}
                                             primaryText={game.hostName}
                                             disabled={!this.state.username}
                                             rightIconButton={
                                                 <IconButton><AvPlayCircleOutline/></IconButton>
                                             }
                                             onClick={() => this.onJoinGame(game)}
                            />
                        } )}
                    </List>
                </div>
            </div>
            <div className="row" style={{height: '10%'}}>
                <div className="col-sm-4 col-sm-offset-2 col-md-2 col-md-offset-1 col-xs-8 col-xs-offset-4">
                  {this.props.children}
                </div>
            </div>
        </Paper>
    }
}
