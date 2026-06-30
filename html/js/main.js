import { GAME_CONFIG } from './config.js';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, GameScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 3840,
            height: 2160
        }
    },
    backgroundColor: '#8B7355'
};

let game = null;

window.addEventListener('load', () => {
    game = new Phaser.Game(config);
    
    window.addEventListener('resize', () => {
        if (game) {
            game.scale.resize(window.innerWidth, window.innerHeight);
        }
    });
});
