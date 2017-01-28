import React, {Component} from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import {List, ListItem} from 'material-ui/List'

export default class GameChat extends Component {

    state = {
        message: '',
        history: []
    }

    static propTypes = {
        newMessage: React.PropTypes.object.isRequired,
        onSendMessage: React.PropTypes.func.isRequired,
        isHost: React.PropTypes.bool
    }

    scrollToBottom = () => {
        const chatContainer = this.refs.chat_container
        chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight
    }

    sendMessage = () => {
        if(this.state.message) {
            const ms = this.state.message;
            this.setState({
                message: ''
            })
            this.props.onSendMessage(ms)
        }
    }

    componentWillReceiveProps(nextProps) {
        if(Object.keys(nextProps.newMessage).length != 0) {
            this.setState({history: [...this.state.history, nextProps.newMessage]})
            setTimeout(this.scrollToBottom, 0)
        }
    }

    render() {

       return (<Paper style={{padding: '1%'}} className="GameChat">
           <div className="row" style={{height: '60%'}}>
               <div className="ChatContainer col-md-12 col-sm-12"
                    ref="chat_container"
               >
                   <List>
                       {this.state.history.map((data, i) => {
                           const isAuthor = this.props.name === data.author
                           return <ListItem key={i}
                                            primaryText={
                                                <p className={isAuthor ? 'HostMsg' : 'GuestMsg'}>
                                                    <b>{data.author}: </b>{data.message}
                                                </p>
                                            }
                                            style={{textAlign:  isAuthor ? 'left' : 'right'}}
                                            innerDivStyle={{padding: '0px', borderRadius: '5px'}}
                           />
                       } )}
                   </List>
               </div>
           </div>
           <div className="row" style={{height: '40%'}}>
               <div className="col-md-10 col-sm-10">
                   <TextField
                       hintText="Write your message..."
                       onChange={(e) => this.setState({message: e.target.value})}
                       value={this.state.message}
                       fullWidth={true}
                       onKeyPress={(e)=>  {
                           if (e.key === 'Enter') this.sendMessage()
                       }}
                   />
               </div>
               <div className="col-md-2 col-sm-2" style={{marginTop: 5}}>
                   <RaisedButton label="Send"
                                 fullWidth={true}
                                 primary={true}
                                 onClick={() => {this.sendMessage()}}
                   />
               </div>
           </div>
       </Paper>)
    }

}