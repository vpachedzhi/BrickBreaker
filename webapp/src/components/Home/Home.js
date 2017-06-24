// @flow

import React, {Component} from 'react'
import styles from './Home.css'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import MenuItem from 'material-ui/MenuItem'
import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import Avatar from 'material-ui/Avatar'
import axios from 'axios'
import store from '../../store'
import {push} from 'react-router-redux'

export default class Home extends Component {

    logOff = () =>{
        axios.get('/logout')
            .then(()=> {
            store.dispatch({type: 'CLEAR_USER'})
            store.dispatch(push('/login'))
        })
            .catch(err => console.log(err))
    }

    render(){
        return <div className={styles.mainContainer}>
            <Toolbar style={{backgroundColor: '#515658'}}>
                <ToolbarGroup firstChild/>
                <ToolbarGroup>
                    <IconMenu
                        style={{marginLeft: '20px'}}
                        iconButtonElement={
                            <IconButton touch={true} style={{'padding': '4px'}}>
                                <Avatar size={40}>
                                    <span >{store.getState().user.name.substr(0,1).toUpperCase()}</span>
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
        </div>
    }
}