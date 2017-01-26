import React, {Component} from 'react'
import {hashHistory} from 'react-router'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import {List, ListItem} from 'material-ui/List'
import AvPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline'
import IconButton from 'material-ui/IconButton'

export default class StartScreen extends Component {
    state = {
        username: '',
        roomId: '',
        roomsList: []
    }

    static propTypes = {
        socket: React.PropTypes.any
    }

    constructor(props) {
        super(props)
        this.props.socket.on('rooms_list_update', (roomsList) => {
            this.setState({roomsList})
        })
    }

    onCreateGame = () => {
        this.props.socket.off('rooms_list_update')
        hashHistory.push(`/game/${this.state.username}`)
    }

    onJoinGame = (roomId) => {
        this.props.socket.emit('join_game', {roomId, name: this.state.username})
    }

    render() {
        return <Paper>
            <div className="row">
                <div className="col-sm-8 col-sm-offset-2 col-md-4 col-md-offset-4">
                    <TextField hintText="Enter username"
                               value={this.state.username}
                               onChange={(e) => this.setState({username: e.target.value})}/>
                    <RaisedButton label="Create game"
                                  primary={true}
                                  disabled={!this.state.username}
                                  onClick={this.onCreateGame}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-8 col-sm-offset-2 col-md-4 col-md-offset-4">
                    <List>
                        {this.state.roomsList.map((item, i) => {
                            return <ListItem key={i}
                                             primaryText={item.hostName}
                                             secondaryText={item.roomId}
                                             disabled={!this.state.username}
                                             rightIconButton={
                                                 <IconButton><AvPlayCircleOutline/></IconButton>
                                             }
                                             onClick={() => this.onJoinGame(item.roomId)}
                            />
                        } )}
                    </List>
                </div>
            </div>
        </Paper>
    }
}
