'use strict';

class Lobby extends Phaser.Scene {
    constructor() {
        super('Lobby');
    }
    preload() {
        this.load.image('menu', 'static/images/snake/menu.png');
    }
    create() {
        this.add.sprite(200, 300, 'menu'); // .setInteractive();
        this.input.on('pointerup', this.startGame, this);
    }
    update() {

    }
    startGame() {
        this.scene.start('Game');
    }
}
