import * as PIXI from 'pixi.js';
import { Board } from './board';

const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
})

// @ts-ignore
document.body.appendChild(app.view)

const board = new Board(app)
app.stage.addChild(board.view)