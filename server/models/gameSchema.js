const mongoose = require('mongoose')
const Schema = mongoose.Schema

const gameSchema = new Schema({
    host: String,
    guest: String,
    winner: String,
    timestamp: Date
})

gameSchema.methods.validateNames = () => {
    return this.host !== this.guest
}

const Game = mongoose.model('games', gameSchema)

module.exports=Game