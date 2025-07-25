import { Scene } from 'phaser';
import p from 'planck'

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    world: p.World
    gameScale: number = 4

    constructor () {
        super('Game');
    }

    create () {
        this.world = new p.World

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);
    }
}
