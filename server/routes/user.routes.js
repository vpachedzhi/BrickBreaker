const express = require('express')
const router = express.Router()
const userToSocket = require('../userSocketMap')
const User = require('../models/userSchema')
const Game = require('../models/gameSchema')

router.post('/register', (req, res) => {
    const {name, password} = req.body
    const user = new User({_id: name, password, available: false})
    user.save((err, data) => {
        if(err) {
            res.status(400).send()
        } else {
            res.status(201).json(data)
        }
    })
})

router.post('/login', (req, res) => {
    const {name, password} = req.body
    User.find({_id: name}, (err, users) => {
        if(!users.length) {
            res.status(404).json("No such user!")
        } else {
            if(password === users[0].password) {
                req.session.user = users[0]
                res.status(202).send()
            } else {
                res.status(400).json("Invalid password!").send()
            }
        }
    })
})

router.get('/isLogged', (req, res) => {
    if(!req.session.user) {
        res.status(401).send()
    } else {
        User.findByIdAndUpdate(req.session.user._id, {$set: {available: true}}, err => console.error(err))
        res.status(200).send()
    }
})

router.get('/logout', (req, res) => {
    if(!req.session) {
        res.status(400)
    } else {
        User.findByIdAndUpdate(req.session.user._id, {$set: {available: false}}, err => console.error(err))

        req.session.destroy()
        res.status(200).send()
    }
})

router.get('/search', (req, res) => {
    const subStr = req.query['query']
    if(!subStr || subStr.length < 3 || subStr.length > 10) {
        res.status(400).json('Search query should be between 3 and 10 symbols !')
    } else if(!req.session.user) {
        res.status(403).send()
    } else {
        User.find({_id: {'$regex' : subStr, '$options' : 'i'}}, (err, users) => {
            if(!err) {
                res.status(200).json(users
                    .filter(user => user._id !== req.session.user._id)
                    .map(user => ({name: user._id, available: user.available}))
                    )
            }
        })
    }
})

router.post('/setSocket', (req, res) => {
    if(!req.session.user)
        res.status(403).send()
    else {
        const socketId = req.body.socketId
        const name = req.body.name
        userToSocket.set(name, socketId)
        res.status(202).send()
    }
})

router.get('/usersOnline', (req, res) => {
    if(!req.session.user)
        res.status(403).send()
    else
        User.find({available: true}, (err, users) =>{
            if(err){
                res.status(500).send()
            }
            else {
                Game.find({}, (err, games) => {
                    if(err){
                        res.status(500).send()
                    }
                    else {
                        res.status(200)
                            .json(users
                                    .map(({_id}) => ({name: _id, coefficient: calcCoefficient(games, _id)}))
                                    .filter(({name}) => name !== req.session.user._id)
                            )
                    }
                })
            }
        })
})

function calcCoefficient(games, playerName) {
    const playersGames =  games.filter(({host, guest}) => playerName === host || playerName === guest)
    if(playersGames.length === 0){
        return -1
    }
    else return playersGames.reduce((acc, next) => {
        return acc + (next.winner === playerName ? 1 : 0)
    }, 0) / playersGames.length
}

module.exports=router