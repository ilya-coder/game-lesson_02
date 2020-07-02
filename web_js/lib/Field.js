'use strict'
import Square from './Square'
import * as PIXI from 'pixi.js'

class Field {
    /**
     * Генерация игрового поля
     * @param {number} width Ширина поля
     * @param {number} height Высота поля
     * @param {PIXI.Container} container Контейнер, к которому крипить отрисованные объекты
     * @returns {void}
     */
    constructor(width, height, container) {
        this.width = width
        this.height = height
        this.container = container
        this.squares = []
        this.status = 'inGame'
        this.lineStyle = 0x0000ff

        this.initSquares()
        this.drawField()
    }

    drawField() {
        if ( typeof this.gameField !== 'undefined') {
            this.container.removeChild(this.gameField)
        }

        this.gameField = new PIXI.Container()

        this.drawBackground()
        this.container.addChild(this.gameField)
    }

    initSquares() {
        this.squares = []
        for (let squareNum = 0; squareNum < 3*3; squareNum++) {
            const row = Math.floor(squareNum / 3)
            const col = squareNum % 3
            const side = this.width / 3
            const x = col * side
            const y = row * side

            const clickHandler = this.squareClick.bind(this)

            this.squares.push(new Square(x, y, side, this.container, clickHandler))
        }
    }

    /**
     * Проверяет, есть ли на поле заполненная линия с одним
     * из символов (x или 0)
     * @param {string} statusSymbol
     * @param {array} line
     * @param {[number]} extendIndexes Дополнительные индекы, нужны для проверки выйгрышных ходов
     * @returns {boolean} true если найдена линия, иначе false
     */
    checkLine(statusSymbol, line, extendIndexes= []) {
        for (const index of line) {
            if ( extendIndexes.indexOf(index) !== -1 ) {
                continue
            } else if ( this.squares[index].status !== statusSymbol) {
                return false
            }
        }

        return true
    }

    /**
     * Проверяет, выйграл ли один из символов (x или 0)
     * @param {string} statusSymbol
     * @param {[number]} [extendIndexes] Дополнительные индекы, нужны для проверки выйгрышных ходов
     * @returns {boolean}
     */
    checkWinStatus(statusSymbol, extendIndexes ) {
        const winState = [
            [0,1,2],
            [3,4,5],
            [6,7,8],
            [0,3,6],
            [1,4,7],
            [2,5,8],
            [0,4,8],
            [6,4,2],
        ]

        for (const stateLine of winState) {
            if ( this.checkLine(statusSymbol, stateLine, extendIndexes) ) {
                return true
            }
        }

        return false
    }

    /**
     * Отрисовка фона
     * @returns {void}
     */
    drawBackground() {
        this.gameField.addChild( PIXI.Sprite.from('/images/bg2.jpg') )

        const graphics = new PIXI.Graphics()

        for ( let x = this.width / 3; x < this.width; x += (this.width / 3) ) {
            graphics.beginFill()
            graphics.lineStyle(1, this.lineStyle, 0.5);
            graphics.moveTo(x, 0)
            graphics.lineTo(x, this.height)
            graphics.closePath()
            graphics.endFill()
        }

        for ( let y = this.height / 3; y < this.height; y += (this.height / 3) ) {
            graphics.beginFill()
            graphics.lineStyle(1, this.lineStyle, 0.5)
            graphics.moveTo(0, y)
            graphics.lineTo(this.width, y)
            graphics.closePath()
            graphics.endFill()
        }

        this.gameField.addChild(graphics)
    }

    /**
     * Выводит на экран сообщение (в конце игры)
     * @param {string} message Сообщение, которое будет выведено
     * @returns {void}
     */
    drawMsg(message){
        this.status = 'stop'
        console.log(`drawMsg(message = "${message}")`)

        const msgBlock = new PIXI.Container()
        msgBlock.x = 0
        msgBlock.y = 80

        const yellowBG = new PIXI.Sprite( PIXI.Texture.WHITE )
        yellowBG.width = this.container.width
        yellowBG.height = 100
        yellowBG.tint = 0xffff00

        yellowBG.interactive = true
        yellowBG.buttonMode = true

        msgBlock.addChild(yellowBG)


        const msgSprite = new PIXI.Text(message, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 80,
            fill: 0xff0000,
        }))

        msgSprite.anchor.set(0.5)
        msgSprite.scale.set(0.5)
        msgSprite.x = yellowBG.width / 2
        msgSprite.y = yellowBG.height / 2

        msgBlock.addChild(msgSprite)

        const clickToReplay = new PIXI.Text('Click to replay', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 70,
            fill: 0xff0000,
        }))

        clickToReplay.anchor.set(0.5)
        clickToReplay.scale.set(0.25)
        clickToReplay.x = yellowBG.width / 2
        clickToReplay.y = yellowBG.height / 2 + msgSprite.height / 2 + 10
        msgBlock.addChild(clickToReplay)

        this.container.addChild(msgBlock)

        yellowBG.on('pointerdown', () => {
            this.status = 'inGame'
            this.container.children.map(child => this.container.removeChild(child) )
            this.gameField.children.map(child => this.gameField.removeChild(child) )
            this.container.addChild(this.gameField)

            this.initSquares()
            this.drawBackground()
            this.squares.map(sq => sq.draw())
            this.container.removeChild(msgBlock)
        })
    }

    /**
     * Ход компа
     * @returns {void}
     */
    doComp() {
        let freeIndexes = []

        for (let i = 0; i < this.squares.length; i++) {
            const sq = this.squares[i]
            if (sq.status === '') {
                freeIndexes.push(i)
            }
        }

        // Если нет свободных клеток
        if (!freeIndexes.length) {
            return
        }

        // Если есть возможность выйграть 1 ходом
        for (const index of freeIndexes) {
            if (this.checkWinStatus('0', [index])) {
                console.log(`Найден выйгрышный индекс ${index}`)
                this.squares[ index ].status = '0'
                return
            }
        }

        // Если есть возможность помешать выйграть пользователю
        for (const index of freeIndexes) {
            if (this.checkWinStatus('x', [index])) {
                console.log(`Найден выйгрышный для пользователя индекс ${index}`)
                this.squares[ index ].status = '0'
                return
            }
        }

        let maxCnt = 0
        let bestIndex = 0
        // Если есть возможность выйграть в 2 хода
        for (const indexA of freeIndexes) {
            let counter = 0
            for (const indexB of freeIndexes) {
                if ( indexA === indexB ) {
                    continue
                }

                if (this.checkWinStatus('0', [indexA, indexB])) {
                    counter++
                }
            }
            if ( counter > maxCnt ) {
                maxCnt = counter
                bestIndex = indexA
            }
        }

        if (maxCnt > 0) {
            console.log(`Вероятно лучший ход на индекс ${bestIndex} (вариантов ходов: ${maxCnt})`)
            this.squares[ bestIndex ].status = '0'
            return
        }

        // Ставим наугад в свободную
        console.log('Хожу наугад')
        this.squares[ freeIndexes[ Math.round(Math.random() * 9999) % freeIndexes.length ] ].status = '0'
    }

    squareClick() {
        if (this.status !== 'inGame') {
            return
        }

        this.squares.map( sq => sq.draw() )

        if (this.checkWinStatus('x')) {
            this.drawMsg( 'YOU WIN' )
            return
        }

        this.doComp()
        this.squares.map( sq => sq.draw() )

        if (this.checkWinStatus('0')) {
            this.drawMsg( 'YOU LOOSE' )
        } else if ( this.isDraw() ) {
            this.drawMsg('DRAW' )
        }
    }

    /**
     * Определяет ничью
     * @returns {boolean}
     */
    isDraw() {
        for (const sq of this.squares) {
            if (sq.status === '') {
                return false
            }
        }

        return true
    }
}

export default Field
