class EventEmitter{

    constructor() {
        this.callbackMapper = {}
    }

    on = (eventName, callback) => {
        const callbacks = this.callbackMapper[eventName]
        this.callbackMapper[eventName] = callbacks ? [...this.callbackMapper[eventName], callback] : [callback]
    }

    emit = (eventName, ...args) => {
        const callbacks = this.callbackMapper[eventName]
        if(callbacks) {
            callbacks.forEach(callback => callback(...args))
        }
    }
}

const ee = new EventEmitter()
export default ee