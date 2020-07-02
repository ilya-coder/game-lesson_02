import * as PIXI from 'pixi.js'
import Field from './lib/Field'

const app = new PIXI.Application({
    height: 300,
    width: 300,
    antialias: true,
})

document.body.appendChild(app.view)
new Field(app.view.width, app.view.height, app.stage)
