'use strict'
import * as PIXI from 'pixi.js'

class Square {
    /**
     * Инициализация клетки
     * @param {number} x
     * @param {number} y
     * @param {number} sideWidth
     * @param {PIXI.Container} root Корневой контейнер
     * @param {function} clickHandler
     * @returns {void}
     */
    constructor(x, y, sideWidth, root, clickHandler) {
        this.root = root

        this.status = ''
        this.x = x
        this.y = y
        this.sideWidth = sideWidth

        this.draw()

        this.onClick = clickHandler
    }

    draw(gameStatus = true) {
        if ( !gameStatus ) {
            return
        }

        if (typeof this.container !== "undefined") {
            this.root.removeChild(this.container)
        }

        this.container = new PIXI.Container()
        this.container.x = this.x
        this.container.y = this.y

        const sqSprite = new PIXI.Sprite( PIXI.Texture.EMPTY )
        sqSprite.width = this.sideWidth
        sqSprite.height = this.sideWidth
        this.container.addChild(sqSprite)

        sqSprite.interactive = true
        sqSprite.buttonMode = true

        if ( this.status === 'x' ) {
            this.drawX()
        } else if ( this.status === '0' ) {
            this.drawZero()
        }

        sqSprite.on('pointerdown', () => {
            if ( this.status === '' ) {
                this.status = 'x'
                this.onClick()
            }
        })

        this.root.addChild(this.container)
    }

    drawX() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 90,
        })

        const Xtext = new PIXI.Text('X', style)
        Xtext.anchor.set(0.5)
        Xtext.x = this.container.width / 2
        Xtext.y = this.container.height / 2
        this.container.addChild(Xtext)
    }

    drawZero() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 90,
        })

        const Xtext = new PIXI.Text('O', style)
        Xtext.anchor.set(0.5)
        Xtext.x = this.container.width / 2
        Xtext.y = this.container.height / 2
        this.container.addChild(Xtext)
    }
}

export default Square
