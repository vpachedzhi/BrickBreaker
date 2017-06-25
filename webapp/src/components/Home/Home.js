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

export default class Home extends Component {

    state: {
        searchData: Array<string>
    } = {
        searchData: []
    }

    logOff = () =>{
        axios.get('/logout')
            .then(()=> {
            store.dispatch({type: 'CLEAR_USER'})
            store.dispatch(push('/login'))
        })
            .catch(err => console.log(err))
    }

    search = (query: string) => {
        if(query.length > 2 && query.length <= 10){
            axios.get('search',{params: {query}})
                .then(({data}) => {
                    console.log(data)
                    this.setState({searchData: data})
                })
        }
    }

    render(){
        return <div className={styles.mainContainer}>
            <Toolbar style={{backgroundColor: '#515658'}}>
                <ToolbarGroup firstChild/>
                <ToolbarGroup>
                    <AutoComplete
                        hintText="Search"
                        filter={AutoComplete.noFilter}
                        openOnFocus={true}
                        dataSource={this.state.searchData}
                        onUpdateInput={this.search}
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
        </div>
    }
}