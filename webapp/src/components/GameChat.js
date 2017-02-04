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
        newMessage: React.PropTypes.string.isRequired,
        onSendMessage: React.PropTypes.func.isRequired
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
            this.addToHistory(true, ms)
        }
    }

    addToHistory = (meAuthor, message) => {
        if(message) {
            this.setState({history: [...this.state.history, {meAuthor, message}]})
            setTimeout(this.scrollToBottom, 0)
        }
    }

    componentWillReceiveProps(nextProps) {
        this.addToHistory(false, nextProps.newMessage)
    }

    render() {

       return (<Paper style={{padding: '1%'}} className="GameChat">
           <div className="row" style={{height: '60%'}}>
               <div className="ChatContainer col-md-12 col-sm-12"
                    ref="chat_container"
               >
                   <List>
                       {this.state.history.map((data, i) => {
                           return <ListItem key={i}
                                            primaryText={
                                                <span className={data.meAuthor ? 'MeMsg' : 'OtherMsg'}>
                                                    {data.message}
                                                </span>
                                            }
                                            style={{textAlign:  data.meAuthor ? 'right' : 'left'}}
                                            innerDivStyle={{padding: '6px', borderRadius: '5px'}}
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