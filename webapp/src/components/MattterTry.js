import React, {Component} from 'react'
import Matter from 'matter-js'
import {
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
} from '../../../server/config'
export default class extends Component {

    componentDidMount() {

        const Engine = Matter.Engine,
            Render = Matter.Render,
            World = Matter.World,
            Bodies = Matter.Bodies;

// create an engine
        const engine = Engine.create();

// create a renderer
        const {width, height} = canvas
        const render = Render.create({
            element: this.c,
            engine: engine,
            options: {
                //wireframes: false,
                background: 'transparent',
                width,
                height
                // showDebug: false,
                // showBroadphase: false,
                // showBounds: false,
                // showVelocity: false,
                // showCollisions: false,
                // showSeparations: false,
                // showAxes: false,
                // showPositions: false,
                // showAngleIndicator: false,
                // showIds: false,
                // showShadows: false,
                // showVertexNumbers: false,
                // showConvexHulls: false,
                // showInternalEdges: false,
                // showMousePosition: false
            }
        });
        engine.world.gravity.x = 0
        engine.world.gravity.y = 0
        // create two boxes and a ground
        const leftPad = Bodies.rectangle(paddle.width/2, height/2, paddle.width, paddle.height, {isStatic: true})
        const rightPad = Bodies.rectangle(width - paddle.width/2, height/2, paddle.width, paddle.height, {isStatic: true})
        const ball = Bodies.circle(width/2, height/2, ballRadius, {isStatic: false})

// add all of the bodies to the world
        World.add(engine.world, [leftPad, rightPad, ball]);

// run the engine
        Engine.run(engine);

// run the renderer
        Render.run(render);
    }

    render() {
        return <div ref={c => this.c = c} style={{margin: 50}}/>
    }

}