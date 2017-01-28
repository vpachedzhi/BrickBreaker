import React, {Component} from 'react'
import Paper from 'material-ui/Paper'
import {List, ListItem} from 'material-ui/List'

export default class ScoreBoard extends Component {

    static propTypes = {
        myName: React.PropTypes.string.isRequired,
        myScore: React.PropTypes.number.isRequired,
        otherName: React.PropTypes.string.isRequired,
        otherScore: React.PropTypes.number.isRequired
    }

    render () {
        return (<Paper style={{height: '100%'}}>
            <List>
                <ListItem primaryText={`${this.props.myName}: ${this.props.myScore}`}/>
                <ListItem primaryText={`${this.props.otherName}: ${this.props.otherScore}`}/>
            </List>
        </Paper>)
    }
}