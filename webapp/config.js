const canvas = {
    width: 1200,
    height: 600
}

const  ballRadius = canvas.width/120

const paddle = {
    width: ballRadius*2,
    height: canvas.height/3
}

module.exports = {
    canvas,
    ballRadius,
    paddle
}

