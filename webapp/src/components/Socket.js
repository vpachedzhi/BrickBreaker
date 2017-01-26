import React, {Component} from 'react'

export default class extends Component {
    constructor(props){
        super(props)
        this.socket = io()
    }
    render() {
        return <div>
            <this.props.children.type socket={this.socket} {...this.props.children.props}/>
        </div>
    }
}