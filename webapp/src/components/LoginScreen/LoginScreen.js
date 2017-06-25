// @flow

import React, {Component} from 'react'
import styles from './LoginScreen.js.css'
import TextField from 'material-ui/TextField'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import axios from 'axios'
import store from '../../store'
import {push} from 'react-router-redux'

export default class LoginScreen extends Component {

    newName: any
    newPassword: any
    name: any
    password: any

    state: {
        newNameFail: boolean
    } = {
        newNameFail: false
    }

    register = () => {
        const name: string = this.newName.input.value
        const password: string = this.newPassword.input.value
        if(name && password)
            axios.post('/register', {name, password})
                .then(res => {
                    console.log(res)
                    this.login(name, password)
                })
                .catch(err => {
                    console.log(err)
                    this.setState({newNameFail: true})
                })
    }

    login = (name: string, password: string) => {
        axios.post('/login', {name, password})
            .then(({status, data}) =>{
                if(status === 404){
                    console.log('WTF')
                }
                if(status === 202){
                    store.dispatch({type: 'SET_USER', payload: data})
                    store.dispatch(push('/'))
                }
            })
    }

    render(){
        return <div className={`${styles.mainContainer} row middle-xs`}>
            <div className="col-xs">
                <div className="row center-xs">
                    <div>
                        <h1>Welcome to BrickBreaker</h1>
                    </div>
                </div>
                <div className="row center-xs">
                    <div className="col">
                        <Paper style={{padding: 30}}>
                            <h3>Register</h3>
                            <TextField
                                floatingLabelText="Username"
                                ref={newName => this.newName = newName}
                                errorText={this.state.newNameFail ? 'This username is already used' : ''}
                            />
                            <br/>
                            <TextField
                                floatingLabelText="Password"
                                ref={newPassword => this.newPassword = newPassword}
                                type="password"
                            />
                            <br/>
                            <RaisedButton
                                label="Register"
                                fullWidth
                                style={{marginTop: 15}}
                                onClick={this.register}
                            />
                        </Paper>
                    </div>
                    <div style={{width: 50}}/>
                    <div className="col">
                        <Paper style={{padding: 30}}>
                            <h3>Login</h3>
                            <TextField
                                floatingLabelText="Username"
                                ref={name => this.name = name}
                            />
                            <br/>
                            <TextField
                                floatingLabelText="Password"
                                ref={password => this.password = password}
                                type="password"
                            />
                            <br/>
                            <RaisedButton
                                label="Login"
                                fullWidth
                                style={{marginTop: 15}}
                                onClick={() => this.login(this.name.input.value, this.password.input.value)}
                            />
                        </Paper>
                    </div>
                </div>
            </div>
        </div>
    }
}