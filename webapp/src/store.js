import {applyMiddleware, compose, createStore, combineReducers} from "redux"
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"
import {routerMiddleware, routerReducer} from "react-router-redux"
import {hashHistory} from "react-router"
// Here imports of the other reducers

//noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const historyMiddleware = routerMiddleware(hashHistory)

const middleware = applyMiddleware(promise(), thunk, historyMiddleware);

export default createStore(
    combineReducers({
        // Here the other reducers
        routing: routerReducer
    }),
    composeEnhancers(middleware)
)
