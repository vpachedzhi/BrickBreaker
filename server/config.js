const canvas = {
    width: 1200,
    height: 600
}

const  ballRadius = canvas.width/120

const paddle = {
    width: ballRadius*2,
    height: canvas.height/4
}

const brickRowCount = 6;
const brickColumnCount = 10;
const brickWidth = 60;
const brickHeight = 30;
const brickPadding = 2;
const brickOffsetTop = (canvas.height - brickRowCount * (brickHeight + brickPadding)) / 2;
const brickOffsetLeft = (canvas.width - brickColumnCount * (brickWidth + brickPadding)) / 2;

module.exports = {
    canvas,
    ballRadius,
    paddle,
    brickRowCount,
    brickColumnCount,
    brickWidth,
    brickHeight,
    brickPadding,
    brickOffsetTop,
    brickOffsetLeft
}

