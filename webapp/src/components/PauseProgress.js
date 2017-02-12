import React, {Component} from 'react'
import Paper from 'material-ui/Paper'
import CircularProgress from 'material-ui/CircularProgress'

export default class  PauseProgress extends Component{
    static propTypes = {
        pauseProgress: React.PropTypes.number.isRequired
    }

    render() {
        return (
            <div className="PauseProgress">
            <Paper style={{display: this.props.pauseProgress > 0 ? '' : 'none'}} zDepth={5} circle={true}>
                <CircularProgress
                    mode="determinate"
                    value={this.props.pauseProgress}
                    size={80}
                    thickness={5}
                />
            </Paper>
        </div>)
    }

}