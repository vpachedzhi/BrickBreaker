//@flow

export type Role = "host" | "guest"

export type ReduxAction = {
    type: 'SET_USER',
    payload: {
        playerName: string,
        role: Role
    }
} | {
    type: 'CLEAR_USER'
} | {
    type: 'SET_INFO',
    payload: {
        myName: string,
        otherName: string,
        myId: string,
        otherId: string
    }
}