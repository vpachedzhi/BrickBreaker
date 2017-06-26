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
import socket from '../../socket'


export default class Home extends Component {

    state: {
        searchData: Array<string>,
        searchText: string,
        opponentName: string
    } = {
        searchData: [],
        searchText: '',
        opponentName: ''
    }

    componentDidMount(){
        socket.on('')
    }

    logOff = () =>{
        axios.get('/user/logout')
            .then(()=> {
            store.dispatch({type: 'CLEAR_USER'})
            store.dispatch(push('/login'))
        })
            .catch(err => console.log(err))
    }

    search = (query: string) => {
        this.setState({searchText: query}, () => {
            if(query.length > 2 && query.length <= 10){
                axios.get('/user/search',{params: {query}})
                    .then(({data}) => {
                        this.setState({searchData: data})
                    })
            }
        })
    }

    handleSearchChoice = (playerName: string) => {
        this.setState({searchText: ''}, () => {
            if(this.state.searchData.find(plN => playerName === plN)){
                this.setState({opponentName: playerName}, () => {
                    socket.emit('invitation_request', playerName)
                })
            }
            this.setState({searchData: []})
        })



    }

    render(){
        return <div className={styles.mainContainer}>
            <Toolbar style={{backgroundColor: '#515658'}}>
                <ToolbarGroup firstChild/>
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
                                    <span>V</span>
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
            <Dialog
                title={`Please wait ${this.state.opponentName} to confirm.`}
                open={!!this.state.opponentName}
                actions={[
                    <FlatButton
                        label="Cancel"
                        icon={<NavigationCancel/>}
                        onClick={() => this.setState({opponentName: ''}, () => console.log('notify cancel'))}
                    />
                ]}
                modal
            >
                <div style={{position: 'relative', height: 40}}>
                    <RefreshIndicator top={0} left={0} status="loading"/>
                </div>
            </Dialog>
        </div>
    }
}