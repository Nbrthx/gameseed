import p from 'planck'
import { Socket } from "socket.io-client"
import { Game } from "../scenes/Game"
import { isMobile } from "../scenes/GameUI"
import { Player } from "../prefabs/Player"
import { Projectile, ProjectileConfig } from '../prefabs/items/RangeWeapon'
import { MapSetup } from './MapSetup'
import { Enemy, enemyList } from '../prefabs/Enemy'

export interface OutputData{
    uid: string,
    pos: { x: number, y: number },
    attackDir: { x: number, y: number },
    health: number
    timestamp: number
}

export interface GameState{
    id: string
    players: (OutputData & { xp: number, isPvpProtected: boolean })[]
    enemies: (OutputData & { id: string })[]
    droppedItems: {
        uid: string
        id: string
        pos: { x: number, y: number }
        quantity: number
    }[]
    projectiles: {
        uid: string
        pos: { x: number, y: number }
        dir: { x: number, y: number }
        config: ProjectileConfig
    }[]
}

interface Account{
    username: string,
    xp: number,
    health: number,
    outfit: {
        isMale: boolean
        hair: string
        face: string
        body: string
        leg: string
    }
    magicBook: string
    ownedBooks: string[]
}

export class NetworkHandler{

    scene: Game
    socket: Socket
    isAuthed: boolean = false
    pendingOutput: GameState[]

    constructor(scene: Game){
        this.scene = scene
        this.socket = scene.socket

        this.pendingOutput = []

        if(!isMobile()) scene.player.aimAssist.setVisible(true)

        setTimeout(() => {
            if(this.isAuthed) return;
            window.location.reload()
        }, 5000)

        console.log(this.socket.id)

        this.socket.emit('joinGame')

        this.socket.on('joinGame', this.joinGame.bind(this))

        this.socket.on('playerJoined', this.playerJoined.bind(this))

        this.socket.on('playerLeft', this.playerLeft.bind(this))

        this.socket.on('output', this.output.bind(this))

        this.socket.on('otherSkillUpdate', this.otherSkillUpdate.bind(this))

        this.socket.on('changeWorld', this.changeWorld.bind(this))

        this.socket.on('otherBookUpdate', this.otherBookUpdate.bind(this))

        this.socket.on('ownedBooksUpdate', this.ownedBooksUpdate.bind(this))

        this.socket.on('questProgress', this.questProgress.bind(this))

        this.socket.on('disconnect', () => {
            this.socket.connect()
            setTimeout(() => {
                location.reload()
            }, 10000)
        })
    }

    joinGame(account: Account, others: {
        uid: string
        username: string
        activeIndex: number
        pos: { x: number, y: number }
        health: number
        outfit: {
            isMale: boolean
            color: number
            hair: string
            face: string
            body: string
            leg: string
        }
        magicBook: string
    }[]){
        const scene = this.scene
        
        console.log(account)
        if(account) this.isAuthed = true

        scene.player.health = account.health
        scene.player.barUpdate(scene.player.damageBar)
        scene.player.magicBook.changeBook(account.magicBook)
        scene.player.equipItem(0)
        // scene.player.syncData(account.health, account.inventory, 0, account.outfit)

        scene.UI.setupUI(scene.player)
        
        scene.UI.booksUI.ownedBooks = account.ownedBooks
        scene.UI.booksUI.showBookList()

        others.forEach(v => {
            if(v.uid == this.socket.id) return
            console.log(v.uid)

            const other = new Player(scene, v.pos.x*scene.gameScale*32, v.pos.y*scene.gameScale*32, v.uid, v.username)
            // other.syncData(v.health, v.items, v.activeIndex, v.outfit)
            other.health = v.health
            other.barUpdate(other.damageBar)
            other.magicBook.changeBook(v.magicBook)
            other.equipItem(v.activeIndex)

            scene.others.push(other)
        })
    }

    playerJoined(data: {
        uid: string
        username: string
        from: string
        health: number
        outfit: {
            isMale: boolean
            color: number
            hair: string
            face: string
            body: string
            leg: string
        }
    }){
        const scene = this.scene

        const pos = scene.mapSetup.enterpoint.get(data.from) || { x: 100, y: 100 }

        const other = new Player(scene, pos.x, pos.y, data.uid, data.username)
        // other.syncData(data.health, data.items, 0, data.outfit)

        scene.others.push(other)
    }

    playerLeft(uid: string){
        const scene = this.scene
        const existPlayer = scene.others.find(other => other.uid == uid)

        if(!existPlayer) return

        scene.others.splice(scene.others.indexOf(existPlayer), 1)
        existPlayer.destroy()
    }

    output(data: GameState){
        console.log('data received', data.id, this.scene.worldId)
        if(data.id != this.scene.worldId) return


        this.pendingOutput.push(data)
    }

    update(data: GameState){
        const scene = this.scene

        const players = data.players

        players.forEach(playerData => {
            const other = scene.others.find(v => v.uid == playerData.uid)

            if(playerData.uid == scene.player.uid){
                const targetPosition = new p.Vec2(playerData.pos.x, playerData.pos.y)
                const currentPosition = scene.player.pBody.getPosition()

                const normalized = targetPosition.clone().sub(currentPosition).add(new p.Vec2())

                if(normalized.length() > 0.08 && scene.player.pBody.getLinearVelocity().length() < 0.08) scene.player.pBody.setLinearVelocity(normalized)

                scene.player.pBody.setPosition(currentPosition.add(targetPosition.sub(currentPosition).mul(0.2)))
                scene.player.attackDir = new p.Vec2(playerData.attackDir.x, playerData.attackDir.y)
                scene.player.isPvpProtected = playerData.isPvpProtected

                scene.realBodyPos.set(scene.player.pBody, playerData.pos)

                if(scene.player.health != playerData.health){
                    if(scene.player.health > playerData.health){
                        scene.camera.shake(100, 0.008)
                        scene.player.hitEffect()
                        // scene.tweens.add({
                        //     targets: scene.UI.redEffect,
                        //     alpha: 0.2,
                        //     duration: 100,
                        //     yoyo: true,
                        //     ease: 'Sine.easeInOut',
                        //     onComplete: () => scene.UI.redEffect.setAlpha(0)
                        // })
                    }
                    scene.player.health = playerData.health
                }
                if(scene.player.health <= 0){
                    this.destroy()
                    scene.scene.start('GameOver')

                }
            }
            else if(other){
                const targetPosition = new p.Vec2(playerData.pos.x, playerData.pos.y)
                const currentPosition = other.pBody.getPosition()

                const normalized = targetPosition.clone().sub(currentPosition).add(new p.Vec2())

                if(normalized.length() > 0.08) other.pBody.setLinearVelocity(normalized)
                else other.pBody.setLinearVelocity(new p.Vec2(0, 0))
            
                scene.realBodyPos.set(other.pBody, playerData.pos)
            
                normalized.normalize()

                other.pBody.setPosition(currentPosition.add(targetPosition.sub(currentPosition).mul(0.2)))
                other.attackDir = new p.Vec2(playerData.attackDir.x, playerData.attackDir.y)
                other.isPvpProtected = playerData.isPvpProtected
                
                if(other.health != playerData.health){
                    if(other.health > playerData.health){
                        other.hitEffect()
                    }
                    other.health = playerData.health
                }
                if(other.health <= 0){
                    scene.others.splice(scene.others.indexOf(other), 1)
                    other.destroy()
                    this.scene.add.particles(other.x, other.y, 'red-particle', {
                        color: [0xcc9999],
                        lifespan: 500,
                        speed: { min: 200, max: 300 },
                        scale: { start: 4, end: 0 },
                        gravityY: 500,
                        emitting: false
                    }).explode(8)
                }
            }
        })

        data.enemies.forEach(enemyData => {
            const enemy = scene.enemies.find(v => v.uid == enemyData.uid)
            if(enemy){
                const targetPosition = new p.Vec2(enemyData.pos.x, enemyData.pos.y)
                const currentPosition = enemy.pBody.getPosition()

                const normalized = targetPosition.clone().sub(currentPosition).add(new p.Vec2())

                if(normalized.length() > 0.08) enemy.pBody.setLinearVelocity(normalized)
                else enemy.pBody.setLinearVelocity(new p.Vec2(0, 0))
            
                scene.realBodyPos.set(enemy.pBody, enemyData.pos)
            
                normalized.normalize()

                enemy.pBody.setPosition(currentPosition.add(targetPosition.sub(currentPosition).mul(0.2)))
                enemy.attackDir = new p.Vec2(enemyData.attackDir.x, enemyData.attackDir.y)
                
                if(enemy.health != enemyData.health){
                    if(enemy.health > enemyData.health){
                        enemy.hitEffect()
                    }
                    enemy.health = enemyData.health
                }
                if(enemy.health <= 0){
                    scene.enemies.splice(scene.enemies.indexOf(enemy), 1)
                    enemy.destroy()
                    this.scene.add.particles(enemy.x, enemy.y, 'red-particle', {
                        color: [0xcc9999],
                        lifespan: 500,
                        speed: { min: 200, max: 300 },
                        scale: { start: 4, end: 0 },
                        gravityY: 500,
                        emitting: false
                    }).explode(8)
                }
            }


            if(!enemy){
                const newEnemy = new Enemy(scene, enemyData.pos.x*scene.gameScale*32, enemyData.pos.y*scene.gameScale*32, enemyData.id, enemyData.uid)
                newEnemy.health = enemyData.health
                newEnemy.barUpdate(newEnemy.damageBar)
                this.scene.enemies.push(newEnemy)
            }
        })

        data.projectiles.forEach(projectileData => {
            const existProjectile = scene.projectiles.find(v => v.uid == projectileData.uid)

            const pos = new p.Vec2(projectileData.pos.x, projectileData.pos.y)
            const dir = new p.Vec2(projectileData.dir.x, projectileData.dir.y)

            if(!existProjectile){
                const projectile = new Projectile(this.scene, pos, dir, projectileData.config, projectileData.uid)
                this.scene.projectiles.push(projectile)
            }
            else{
                existProjectile.pBody.setPosition(pos)
                existProjectile.update()
            }
        })

        scene.projectiles.sort(a => a.active ? 1 : -1)
        scene.projectiles.slice().reverse().forEach((projectile) => {
            const projectileData = data.projectiles.find(v => v.uid == projectile.uid)
            if(!projectileData){
                scene.projectiles.splice(scene.projectiles.indexOf(projectile), 1)
                projectile.destroy()

                const x = Math.cos(projectile.pBody.getAngle())*projectile.config.hitboxSize.width*32*4
                const y = Math.sin(projectile.pBody.getAngle())*projectile.config.hitboxSize.height*32*4

                this.scene.add.particles(projectile.x+x, projectile.y+y, 'explode', {
                    speedX: {min: -100, max: 100},
                    speedY: {min: -100, max: 100},
                    scale: {start: 4, end: 4},
                    alpha: {start: 1, end: 0},
                    anim: 'explode',
                    lifespan: 160
                }).explode(1)
            }
        })
        
    }

    otherSkillUpdate(uid: string, index: number){
        const other = this.scene.others.find(v => v.uid == uid)
        if(!other) return

        other.equipItem(index)
    }

    changeWorld(from: string | null, worldId: string, isPvpAllowed: boolean){
        const scene = this.scene

        if(isPvpAllowed){
            scene.UI.alertBox.setAlert('Do you want to enter pvp zone?', true, () => {
                scene.worldId = worldId
                scene.mapSetup.destroy()
                scene.mapSetup = new MapSetup(scene, worldId.split(':')[0])
                
                const enterPos = scene.mapSetup.enterpoint.get(from || 'spawn') || { x: 100, y: 100 }
                
                scene.camera.centerOn(enterPos.x, enterPos.y)
                scene.player.pBody.setPosition(new p.Vec2(enterPos.x/scene.gameScale/32, enterPos.y/scene.gameScale/32))

                scene.world.queueUpdate(() => scene.socket.emit('confirmChangeWorld'))
            })
        }
        else{
            scene.worldId = worldId
            scene.mapSetup.destroy()
            scene.mapSetup = new MapSetup(scene, worldId.split(':')[0])
            
            const enterPos = scene.mapSetup.enterpoint.get(from || 'spawn') || { x: 100, y: 100 }
            
            scene.camera.centerOn(enterPos.x, enterPos.y)
            scene.player.pBody.setPosition(new p.Vec2(enterPos.x/scene.gameScale/32, enterPos.y/scene.gameScale/32))

            scene.world.queueUpdate(() => scene.socket.emit('confirmChangeWorld'))
        }

    }

    otherBookUpdate(uid: string, id: string){
        const other = this.scene.others.find(v => v.uid == uid)
        if(!other) return

        other.magicBook.changeBook(id)
        other.equipItem(0)
    }

    ownedBooksUpdate(ownedBooks: string[]){
        this.scene.UI.booksUI.ownedBooks = ownedBooks
        this.scene.UI.booksUI.showBookList()
    }

    questProgress(taskInstruction: string, taskProgress?: { type: string, target: string, progress: number, max: number }[]){
        const scene = this.scene

        let text = '\n'
        taskProgress?.forEach(v => {
            let target = ''
            if(v.type == 'kill') target = enemyList.find((enemy) => enemy.id == v.target)?.name || v.target
            text += `${v.type} ${target}: ${v.progress}/${v.max}\n`
        })
        
        scene.UI.instructionText.setText(taskInstruction+text)
    }

    destroy(){
        this.socket.removeAllListeners()
    }
}