'use strict';

function Main() {
    let config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                debug: false,
            }
        },
        scene: [ Menu, Gameover, Game ]
    }
    let game = new Phaser.Game(config);
}
