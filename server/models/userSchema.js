const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    password: String,
    _id: String,
    available: Boolean
})

userSchema.methods.validateName = () => {
    return this._id.length >=4 && this._id.length <= 10
}

const User = mongoose.model('users', userSchema)

module.exports=User
