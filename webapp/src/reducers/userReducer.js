//@flow
import type {ReduxAction, Role} from './actions'

export default function (user: ?{
                            name: string,
                            role: Role
                         } = null,
                         action: ReduxAction) {

    switch (action.type){
        case 'SET_USER':{
            return {
                name: action.payload.playerName,
                role: action.payload.role
            }
        }
        case 'CLEAR_USER':{
            return null
        }
        default:
            return user
    }
}