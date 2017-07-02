const express = require('express')
const router = express.Router()
const Game = require('../db')

router.get('/playerCoefficient', (req, res) => {
    const playerName = req.query['name']
    Game.find({$or: [{host: playerName}, {guest: playerName}]}, (err, games) => {
        if(err) {
            console.log(err)
        } else {
            if(!games.length) {
                res.status(200).json(-1)
            } else {
                const gamesPlayed = games.length
                const gamesWon = games.reduce((acc, next) => {
                    return acc + (next.winner === playerName ? 1 : 0)
                }, 0)
                const coefficient = (gamesWon / gamesPlayed)
                res.status(200).json(coefficient)
            }
        }
    })
})

router.post('/makeGame', (req, res) => {
    const host = req.body.host
    const guest = req.body.guest
    const winner = req.body.winner
    const date = new Date()
    const game = new Game({host, guest, winner, date})
    game.save((err, data) => {
        if(err) {
            res.status(400).send()
        } else {
            res.status(201).json(data)
        }
    })
})

module.exports=router