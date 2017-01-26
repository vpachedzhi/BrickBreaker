import React, {Component} from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import {List, ListItem} from 'material-ui/List'

export default class GameChat extends Component {

    state = {
        message: '',
        messages: []
    }

    scrollToBottom = () => {
        const chatContainer = this.refs.chat_container
        chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight
    }

    sendMessage = () => {
        if(this.state.message) {
            const ms = this.state.message;
            this.setState({
                message: '',
                messages:[...this.state.messages, ms]
            })
            setTimeout(this.scrollToBottom, 10)
        }
    }

    render() {
       return (<Paper style={{padding: '1%'}}>
           <div className="row">
               <div className="col-md-12 col-sm-12"
                    style={{height: '100px', overflowY: 'scroll', wordWrap: 'break-word'}}
                    ref="chat_container"
               >
                   <List>
                       {this.state.messages.map((message, i) => {
                           return <ListItem key={i}
                                            primaryText={message}
                           />
                       } )}
                   </List>
               </div>
           </div>
           <div className="row">
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