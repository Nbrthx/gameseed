import { Scene } from 'phaser';
import p from 'planck'
import { MapSetup } from '../components/MapSetup';
import { createDebugGraphics } from '../components/PhysicsDebug';
import { Player } from '../prefabs/Player';
import { GameUI, isMobile } from './GameUI';
import { Socket } from 'socket.io-client';
import { GameState, NetworkHandler, OutputData } from '../components/NetworkHandler';
import { SpatialAudio } from '../components/SpatialAudio';
import { Projectile } from '../prefabs/items/RangeWeapon';
import { Enemy } from '../prefabs/Enemy';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    world: p.World
    worldId: string
    gameScale: number = 4
    UI: GameUI
    socket: Socket

    isDebug: boolean = false
    debugGraphics: Phaser.GameObjects.Graphics
    mapSetup: MapSetup
    networkHandler: NetworkHandler
    spatialAudio: SpatialAudio

    player: Player;
    attackDir: p.Vec2 = new p.Vec2()
    others: Player[]
    enemies: Enemy[]
    projectiles: Projectile[]

    realBodyPos: Map<p.Body, { x: number, y: number }> = new Map()

    accumulator: number = 0;
    previousTime: number;

    constructor () {
        super('Game');
    }

    create () {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x060910);

        this.world = new p.World
        this.worldId = 'map1'

        this.debugGraphics = this.add.graphics().setDepth(1000)
        this.mapSetup = new MapSetup(this, 'map1')

        this.spatialAudio = new SpatialAudio(this)

        this.UI = (this.scene.get('GameUI') || this.scene.add('GameUI', new GameUI(), true)) as GameUI

        this.socket = this.UI.socket
        
        const enterPos = this.mapSetup.enterpoint.get('spawn') || { x: 100, y: 100 }
        this.player = new Player(this, enterPos.x, enterPos.y, this.socket.id as string, this.registry.get('username') || 'null')
        this.spatialAudio.addListenerBody(this.player.pBody)
        this.player.nameText.setColor('#66ffcc')
        this.camera.startFollow(this.player, true, 0.1, 0.1)

        this.others = []
        this.enemies = []
        this.projectiles = []

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if(!this.player) return;
            if(isMobile()) return

            let x = pointer.worldX-this.player.x
            let y = pointer.worldY-this.player.y-12
            const rad = Math.atan2(y, x)

            this.player.aimAssist.setRotation(rad)

            this.camera.setFollowOffset(-x/this.gameScale/4, -y/this.gameScale/4)
        })

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, objects: Phaser.GameObjects.GameObject[]) => {
            if(!this.player) return;
            if(isMobile()) return
            if(objects.length > 0) return

            let x = pointer.worldX-this.player.x
            let y = pointer.worldY-this.player.y-12

            const dir = new p.Vec2(x, y)
            dir.normalize()

            this.attackDir = dir
        })

        this.lights.enable()
        this.lights.setAmbientColor(0xccddee)

        this.networkHandler = new NetworkHandler(this)

        this.accumulator = 0
        this.previousTime = performance.now()
    }

    update(currentTime: number){
        if(!this.networkHandler || !this.networkHandler.isAuthed) return;

        const frameTime = (currentTime - this.previousTime) / 1000; // in seconds
        this.previousTime = currentTime;
        this.accumulator += frameTime;
        while (this.accumulator >= 1/60) {
            this.world.step(1/60);
            this.accumulator -= 1/60;

            this.handleInput()

            this.handleOutput()

            if(this.isDebug) createDebugGraphics(this, this.debugGraphics)
        }
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

        if(vel.length() > 0 || this.attackDir.length() > 0){
            this.socket.emit('playerInput', {
                dir: { x: vel.x, y: vel.y },
                attackDir: { x: this.attackDir.x, y: this.attackDir.y }
            })
            this.attackDir = new p.Vec2()
        }
    }

    handleOutput(){
        const pendingUpdates = this.networkHandler.pendingOutput.splice(0); // Ambil semua data dan kosongkan antrian

        if (pendingUpdates.length > 0) {
            const latestPlayers = new Map<string, OutputData & { xp: number, isPvpProtected: boolean }>();
            const latestEnemies = new Map<string, OutputData & { id: string }>();
            
            let finalDroppedItems: GameState['droppedItems'] = [];
            let finalProjectiles: GameState['projectiles'] = [];

            pendingUpdates.forEach(gameState => {
                if(gameState.id != this.worldId) return

                gameState.players.forEach(playerData => {
                    const existingPlayer = latestPlayers.get(playerData.uid);
                    if (existingPlayer) {
                        if(playerData.attackDir.x != 0 || playerData.attackDir.y != 0){
                            existingPlayer.attackDir = playerData.attackDir;
                        }
                        existingPlayer.timestamp = playerData.timestamp
                        existingPlayer.pos = playerData.pos;
                        existingPlayer.health = playerData.health;
                        existingPlayer.xp = playerData.xp;
                        existingPlayer.isPvpProtected = playerData.isPvpProtected
                    } else {
                        latestPlayers.set(playerData.uid, playerData);
                    }
                });

                gameState.enemies.forEach(enemyData => {
                    const existingEnemy = latestEnemies.get(enemyData.uid);
                    if (existingEnemy) {
                        if(enemyData.attackDir.x != 0 || enemyData.attackDir.y != 0){
                            existingEnemy.attackDir = enemyData.attackDir;
                        }
                        existingEnemy.timestamp = enemyData.timestamp
                        existingEnemy.pos = enemyData.pos;
                        existingEnemy.health = enemyData.health;
                    } else {
                        latestEnemies.set(enemyData.uid, enemyData);
                    }
                });

                // Ambil daftar droppedItems dan projectiles dari GameState saat ini (yang terakhir akan digunakan)
                finalDroppedItems = gameState.droppedItems;
                finalProjectiles = gameState.projectiles;
            });

            const mergedGameState: GameState = {
                id: this.worldId,
                players: Array.from(latestPlayers.values()),
                enemies: Array.from(latestEnemies.values()),
                droppedItems: finalDroppedItems,
                projectiles: finalProjectiles,
            };

            this.networkHandler.update(mergedGameState); // Panggil update sekali dengan data yang sudah digabung
        }

        this.player.update()

        this.others.forEach(other => {
            if(other.active) other.update()
        })

        this.enemies.forEach(enemy => {
            if(enemy.active) enemy.update()
        })
    }
}
