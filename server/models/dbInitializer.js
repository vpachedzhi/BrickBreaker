const User = require('./userSchema')
const Game = require('./gameSchema')

const initializeDummyData = () => {
    User.collection.remove()
    Game.collection.remove()
    initializeUserData()
    initializeGameData()
}

const initializeUserData = () => {
    new User({_id: 'denis', password: 'denis', available: false}).save()
    new User({_id: 'veke', password: 'veke', available: false}).save()
    new User({_id: 'vasko', password: 'vasko', available: false}).save()
    new User({_id: 'valcho', password: 'valcho', available: false}).save()
    new User({_id: 'dexter', password: 'dexter', available: false}).save()
}

const initializeGameData = () => {
    new Game({host: 'veke', guest: 'vasko', winner: 'veke', date: new Date()}).save()
    new Game({host: 'veke', guest: 'vasko', winner: 'veke', date: new Date()}).save()
    new Game({host: 'veke', guest: 'vasko', winner: 'vasko', date: new Date()}).save()
    new Game({host: 'denis', guest: 'dexter', winner: 'denis', date: new Date()}).save()
    new Game({host: 'dexter', guest: 'veke', winner: 'veke', date: new Date()}).save()
    new Game({host: 'denis', guest: 'valcho', winner: 'denis', date: new Date()}).save()
    new Game({host: 'valcho', guest: 'vasko', winner: 'valcho', date: new Date()}).save()
    new Game({host: 'vasko', guest: 'valcho', winner: 'vasko', date: new Date()}).save()
    new Game({host: 'vasko', guest: 'dexter', winner: 'vasko', date: new Date()}).save()
    new Game({host: 'dexter', guest: 'valcho', winner: 'valcho', date: new Date()}).save()
    new Game({host: 'veke', guest: 'vasko', winner: 'vasko', date: new Date()}).save()
}

module.exports = initializeDummyData