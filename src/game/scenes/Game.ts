import { Scene } from 'phaser';
import p from 'planck'
import { MapSetup } from '../components/MapSetup';
import { createDebugGraphics } from '../components/PhysicsDebug';
import { Player } from '../prefabs/Player';
import { GameUI } from './GameUI';
import { Socket } from 'socket.io-client';
import { NetworkHandler } from '../components/NetworkHandler';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    world: p.World
    gameScale: number = 4
    UI: GameUI
    socket: Socket

    debugGraphics: Phaser.GameObjects.Graphics
    mapSetup: MapSetup
    networkHandler: NetworkHandler

    player: Player;
    others: Player[] = []

    constructor () {
        super('Game');
    }

    create () {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x060910);

        this.world = new p.World

        this.debugGraphics = this.add.graphics().setDepth(1000)
        this.mapSetup = new MapSetup(this, 'map1')

        this.UI = (this.scene.get('GameUI') || this.scene.add('GameUI', new GameUI(), true)) as GameUI

        this.socket = this.UI.socket

        const enterPos = this.mapSetup.enterpoint.get('spawn') || { x: 100, y: 100 }
        this.player = new Player(this, enterPos.x, enterPos.y, this.socket.id as string, this.registry.get('username') || 'null')
        // scene.spatialAudio.addListenerBody(scene.player.pBody)
        this.player.nameText.setColor('#66ffcc')
        this.camera.startFollow(this.player, true, 0.1, 0.1)

        this.lights.enable()
        this.lights.setAmbientColor(0xeeffcc)

        this.networkHandler = new NetworkHandler(this)
    }

    update(){
        this.world.step(1/60)

        this.handleInput()

        createDebugGraphics(this, this.debugGraphics)
    }

    handleInput(){
        const vel = new p.Vec2()
    
        if(this.UI.keyboardInput.up){
            vel.y = -1;
        }
        if(this.UI.keyboardInput.down){
            vel.y = 1;
        }
        if(this.UI.keyboardInput.left){
            vel.x = -1;
        }
        if(this.UI.keyboardInput.right){
            vel.x = 1;
        }
        
        vel.normalize();

        vel.mul(this.player.speed);
        this.player.pBody.setLinearVelocity(vel)

        this.player.update()
    }
}
