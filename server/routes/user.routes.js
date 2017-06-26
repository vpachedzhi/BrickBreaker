const express = require('express')
const router = express.Router()
const userToSocket = require('../userSocketMap')
const User = require('../dbInitializer')
const io = require('../index')

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
    const {name, password, socketId} = req.body
    User.find({_id: name}, (err, users) => {
        if(!users.length) {
            res.status(404).json("No such user!")
        } else {
            if(password == users[0].password) {
                req.session.user = users[0]
                userToSocket.set(name, socketId)
                User.findByIdAndUpdate(name, {$set: {available: true}}, function (err, user) {
                    if(err) {
                        console.error(err)
                    }
                })

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
        res.status(200).send()
    }
})

router.get('/logout', (req, res) => {
    if(!req.session) {
        res.status(400)
    } else {
        User.findByIdAndUpdate(req.session.user._id, {$set: {available: false}}, function (err) {
            if(err) {
                console.error(err)
            }
        })

        req.session.destroy()
        res.status(200).send()
        console.log('  logged out')
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

module.exports=router