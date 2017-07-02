import React, {Component} from 'react'
import Paper from 'material-ui/Paper'
import {List, ListItem} from 'material-ui/List'
import socket from '../socket'

export default class ScoreBoard extends Component {

    props: {

    }

    state = {
        host: 0,
        hostLives: 0,
        guest: 0,
        guestLives: 0
    }

    componentDidMount() {
        socket.on('score_update', score => {
            this.setState({
                host: score.host, hostLives: score.hostLives,
                guest: score.guest, guestLives: score.guestLives})
        })
    }

    componentWillUnmount() {
        socket.off('score_update')
    }

    render () {
        return (<Paper style={{height: '100%'}}>
            <List>
                <ListItem primaryText={`${this.props.myName}: ${this.props.isHost ? this.state.host : this.state.guest}     Lives: ${this.props.isHost ? this.state.hostLives : this.state.guestLives}`}
                />
                <ListItem primaryText={`${this.props.otherName}: ${!this.props.isHost ? this.state.host : this.state.guest}     Lives: ${!this.props.isHost ? this.state.hostLives : this.state.guestLives}`}
                />
            </List>
            <div className="row">
                <div className="col-sm-6 col-sm-offset-1"> {this.props.children} </div>
            </div>
        </Paper>)
    }
}