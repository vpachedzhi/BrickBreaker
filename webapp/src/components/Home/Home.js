// @flow

import React, {Component} from 'react'
import styles from './Home.css'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import MenuItem from 'material-ui/MenuItem'
import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import Avatar from 'material-ui/Avatar'
import AutoComplete from 'material-ui/AutoComplete'
import axios from 'axios'
import store from '../../store'
import {push} from 'react-router-redux'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import NavigationCancel from 'material-ui/svg-icons/navigation/cancel'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import ActionDone from 'material-ui/svg-icons/action/done'
import socket from '../../socket'
import {List, ListItem} from 'material-ui/List'
import RatingStars from "../RatingStars/RatingStars"


export default class Home extends Component {

    state: {
        searchData: Array<Object>,
        searchText: string,
        opponentName: string,
        confirmModalOpen: boolean,
        invitee: string,
        rating: number,
        usersOnline: Array<{name: string, coefficient: number}>
    } = {
        searchData: [],
        searchText: '',
        opponentName: '',
        confirmModalOpen: false,
        invitee: '',
        rating: 0,
        usersOnline: []
    }

    onlineUsersInterval: any

    constructor(){
        super()
        if(localStorage.getItem('user')){
            //$FlowFixMe
            axios.post('/user/setSocket',{socketId: socket.id, name: JSON.parse(localStorage.getItem('user')).name})
        }
    }

    componentDidMount() {

        socket.on('invitation', ({invSocketId, invitee}) => {
            this.setState({confirmModalOpen: true, invitee})
        })
        socket.on('declined', () => this.setState({
            opponentName: '',
            confirmModalOpen: false,
            invitee: ''
        }))

        socket.on('accepted', () => {
            store.dispatch({type: "SET_USER", payload: {
                //$FlowFixMe
                playerName: JSON.parse(localStorage.getItem('user')).name,
                role: "host"
            }})
            this.setState({opponentName: ''})
        })

        socket.on('game_ready', ({invited, invitedSid, invitee, inviteeSid}) => {
            const isHost: boolean = store.getState().user.role === 'host'
            const payload = {
                myName: isHost ? invitee : invited,
                otherName: isHost ? invited : invitee,
                myId: isHost ? inviteeSid : invitedSid,
                otherId: isHost ? invitedSid : inviteeSid
            }
            store.dispatch({type: 'SET_INFO', payload})
            store.dispatch(push('/game'))
        })
        if(localStorage.getItem('user')) {
            axios.get('/game/playerCoefficient', {
                params: {
                    //$FlowFixMe
                    name: JSON.parse(localStorage.getItem('user')).name
                }
            })
                .then(({data}) => {
                    this.setState({rating: data})
                })
            this.getOnlineUsers()
            this.onlineUsersInterval = setInterval(this.getOnlineUsers, 10 * 1000)

        }
    }

    getOnlineUsers = () => axios.get('/user/usersOnline')
        .then(({data}) => {
            this.setState({usersOnline: data})
        })

    componentWillUnmount() {
        socket.off('invitation')
        socket.off('declined')
        socket.off('accepted')
        clearInterval(this.onlineUsersInterval)
    }

    logOff = () =>{
        axios.get('/user/logout')
            .then(()=> {
            localStorage.removeItem('user')
            store.dispatch(push('/login'))
        })
            .catch(err => console.log(err))
    }

    search = (query: string) => {
        this.setState({searchText: query}, () => {
            if(query.length > 2 && query.length <= 10){
                axios.get('/user/search',{params: {query}})
                    .then(({data}) => {
                        this.setState({searchData: data.map(user => ({text: user.name, user, value: (
                            <MenuItem
                                primaryText={user.name}
                                rightIcon={user.available ? <ActionDone/> : null}
                                disabled={!user.available}
                            />)}))})
                    })
            }
        })
    }

    handleSearchChoice = (selected: Object) => {
        this.setState({searchText: ''}, () => {
            if(this.state.searchData.find(({user}) => selected.user.name === user.name)){
                this.setState({opponentName: selected.user.name}, () => {
                    socket.emit('invitation_request', {
                        opponent: selected.user.name,
                        //$FlowFixMe
                        invitee: JSON.parse(localStorage.getItem('user')).name})
                })
            }
            this.setState({searchData: []})
        })



    }

    acceptInvitation = (): void => {
        this.setState({confirmModalOpen: false}, () => {
            socket.emit('accept', {
                invitee: this.state.invitee,
                //$FlowFixMe
                invited: JSON.parse(localStorage.getItem('user')).name
            })
            store.dispatch({
                type: 'SET_USER',
                payload: {
                    //$FlowFixMe
                    playerName: JSON.parse(localStorage.getItem('user')).name,
                    role: "guest"
                }
            })
        })
    }

    declineInvitation = (): void => {
        socket.emit('decline', this.state.opponentName ? this.state.opponentName : this.state.invitee)
        this.setState({
            opponentName: '',
            confirmModalOpen: false,
            invitee: ''
        })
    }

    render(){
        //$FlowFixMe
        return localStorage.getItem('user') && <div className={styles.mainContainer}>
            <Toolbar style={{backgroundColor: '#515658'}}>
                <ToolbarGroup firstChild>
                    {/*$FlowFixMe*/}
                    <h1 className={styles.username}>{JSON.parse(localStorage.getItem('user')).name}</h1>
                </ToolbarGroup>
                <ToolbarGroup>
                    <RatingStars rating={this.state.rating} size={40}/>
                </ToolbarGroup>
                <ToolbarGroup>
                    <AutoComplete
                        hintText="Search players"
                        filter={AutoComplete.noFilter}
                        openOnFocus={true}
                        dataSource={this.state.searchData}
                        searchText={this.state.searchText}
                        onUpdateInput={this.search}
                        onNewRequest={this.handleSearchChoice}
                    />
                </ToolbarGroup>
                <ToolbarGroup>
                    <IconMenu
                        style={{marginLeft: '20px'}}
                        iconButtonElement={
                            <IconButton touch={true} style={{'padding': '4px'}}>
                                <Avatar size={40}>
                                    {/*<span >{store.getState().user.name.substr(0,1).toUpperCase()}</span>*/}
                                    <span>B</span>
                                </Avatar>
                            </IconButton>
                        }
                        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                        targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    >
                        <MenuItem primaryText="Log out" onTouchTap={this.logOff}/>
                    </IconMenu>
                </ToolbarGroup>
            </Toolbar>
            <div className="row center-xs">
                <div className="col-xs-3">
                    <List style={{height: 700, overflowY: 'scroll'}}>
                        {this.state.usersOnline.map(({name, coefficient}: {name: string, coefficient: number}, i:number) => (
                            <ListItem
                                rightIcon={<ActionDone/>}
                                primaryText={name}
                                secondaryText={<RatingStars rating={coefficient} size={24}/>}
                                key={i}
                                onClick={() => this.setState({opponentName: name}, () => {
                                    socket.emit('invitation_request', {
                                        opponent: name,
                                        //$FlowFixMe
                                        invitee: JSON.parse(localStorage.getItem('user')).name})
                                })}
                            />
                        ))}
                    </List>
                </div>
            </div>



            <Dialog
                title={`Please wait ${this.state.opponentName} to confirm.`}
                open={!!this.state.opponentName}
                actions={[
                    <FlatButton
                        label="Cancel"
                        icon={<NavigationCancel/>}
                        onClick={this.declineInvitation}
                    />
                ]}
                modal
            >
                <div style={{position: 'relative', height: 40}}>
                    <RefreshIndicator top={0} left={0} status="loading"/>
                </div>
            </Dialog>
            <Dialog
                title={`${this.state.invitee} wants to play with you.`}
                open={this.state.confirmModalOpen}
                actions={[
                    <FlatButton
                        label="Accept"
                        icon={<ActionDone/>}
                        onClick={this.acceptInvitation}
                    />,
                    <FlatButton
                        label="Cancel"
                        icon={<NavigationCancel/>}
                        onClick={this.declineInvitation}
                    />
                ]}
                modal
            >
            </Dialog>
        </div>
    }
}