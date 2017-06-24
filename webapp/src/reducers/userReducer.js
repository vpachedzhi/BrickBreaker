//@flow
import type {ReduxAction} from './actions'
//$FlowFixMe
export default function (user = !!localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
                         action: ReduxAction) {

    switch (action.type){
        case 'SET_USER':{
            localStorage.setItem('user', JSON.stringify(action.payload))
            return action.payload
        }
        case 'CLEAR_USER':{
            localStorage.removeItem('user')
            return null
        }
        default:
            return user
    }
}