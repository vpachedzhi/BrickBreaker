import React, {Component} from 'react'
import MusicController from './MusicController'

export default class BaseRoute extends Component {

    constructor(props){
        super(props)
        this.socket = io()
    }

    render() {
        return <div>
            <this.props.children.type socket={this.socket} {...this.props.children.props}>
                <MusicController/>
            </this.props.children.type>
        </div>
    }
}