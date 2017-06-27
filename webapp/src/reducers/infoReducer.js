//@flow
import type {ReduxAction} from './actions'

export default function (info: {
                            myName: string,
                            otherName: string,
                            myId: string,
                            otherId: string
                         } = {
                             myName: '',
                             otherName: '',
                             myId: '',
                             otherId: ''
                         },
                         action: ReduxAction) {

    switch (action.type){
        case 'SET_INFO':{
            return action.payload
        }

        default:
            return info
    }
}