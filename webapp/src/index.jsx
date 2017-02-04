import React from "react"
import ReactDom from "react-dom"
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import darkBaseTheme from "material-ui/styles/baseThemes/darkBaseTheme"
import getMuiTheme from "material-ui/styles/getMuiTheme"
import {Router, Route, IndexRoute, hashHistory} from 'react-router'
import BaseRoute from './components/BaseRoute'
import StartScreen from './components/StartScreen'
import GameScreen from './components/GameScreen'

injectTapEventPlugin()

const App = () => (
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <Router history={hashHistory}>
            <Route path="/" component={BaseRoute}>
                <IndexRoute component={StartScreen}/>
                <Route path="/game/:name/:role" component={GameScreen}/>
            </Route>
        </Router>
    </MuiThemeProvider>
)

ReactDom.render(<App/>, document.getElementById('brickBreaker'))