'use strict';

class Gameover extends Phaser.Scene {
    constructor() {
        super('Gameover');
    }
    preload() {
        this.load.image('gameover', 'static/images/snake/gameover.png');
    }
    create() {
        this.add.sprite(200, 300, 'gameover'); // .setInteractive();
        this.input.on('pointerup', this.restartGame, this);
    }
    update() {
        // console.log(1);
    }
    restartGame() {
        this.scene.start('Game');
    }
}
