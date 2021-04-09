'use strict';

class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }
    preload() {
        this.load.image('menu', 'static/images/snake/menu.png');
    }
    create() {
        this.add.sprite(400, 300, 'menu'); // .setInteractive();
        this.input.on('pointerup', this.startGame, this);
    }
    update() {
        // console.log(2);
    }
    startGame() {
        this.scene.start('Game');
    }
}
