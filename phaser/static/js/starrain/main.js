'use strict';

function Main() {
    let config = {
        type: Phaser.AUTO,
        width: 400,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                debug: false,
            }
        },
        scene: [ Lobby, Game, Gameover ]
    }
    let game = new Phaser.Game(config);
}
