// @flow
import React from "react"
import ReactDom from "react-dom"
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import darkBaseTheme from "material-ui/styles/baseThemes/darkBaseTheme"
import getMuiTheme from "material-ui/styles/getMuiTheme"
import {Router, Route, IndexRoute, hashHistory} from 'react-router'
import {Provider} from "react-redux"
import {syncHistoryWithStore} from "react-router-redux"
import store from "./store"
import BaseRoute from './components/BaseRoute'
import GameScreen from './components/GameScreen'
import LoginScreen from "./components/LoginScreen/LoginScreen"
import Home from "./components/Home/Home"
import axios from 'axios'
injectTapEventPlugin()
const history = syncHistoryWithStore(hashHistory, store)
import {push, replace} from 'react-router-redux'

const App = () => (
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <Provider store={store}>
            <Router history={history}>
                <Route path="/" component={BaseRoute} onEnter={checkLogin}>
                    <IndexRoute component={Home} />
                    <Route path="/game/:name/:role" component={GameScreen} />
                </Route>
                <Route path="*" component={LoginScreen}/>
            </Router>
        </Provider>
    </MuiThemeProvider>
)

ReactDom.render(<App/>, document.getElementById('brickBreaker'))

function checkLogin(nextState, replace){
    // Why thr fuck replace function doesn't work
    // replace({
    //     pathname: '/login',
    //     state: {nextPathname: nextState.location.pathname}
    // })
    axios.get('/isLogged')
        .catch(err => {
            store.dispatch(push('/login'))
        })
}