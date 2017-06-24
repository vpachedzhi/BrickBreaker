//@flow

export type ReduxAction = {
    type: 'SET_USER',
    payload: any
} | {
    type: 'CLEAR_USER'
}