import React from "react"
import ReactDom from "react-dom"
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import darkBaseTheme from "material-ui/styles/baseThemes/darkBaseTheme";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper';
injectTapEventPlugin()

const App = () => (
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <Paper>
            <FlatButton label="Default" />
            <FlatButton label="Primary" primary={true} />
            <FlatButton label="Secondary" secondary={true} />
            <FlatButton label="Disabled" disabled={true} />
        </Paper>
    </MuiThemeProvider>
)

ReactDom.render(<App/>, document.getElementById('brickBreaker'));