import * as p from 'planck'
import { GameManager, InputData } from './GameManager'
import { ContactEvents } from './components/ContactEvents'
import { MapSetup } from './components/MapSetup'
import { Account } from './server'
import { Player } from './prefabs/Player'
import { Enemy } from './prefabs/Enemy'
import { Projectile } from './prefabs/items/RangeWeapon'
import { BaseItem } from './prefabs/BaseItem'
import { Quests } from './components/Quests'

export interface GameConfig{
    mapId: string
    isPvpAllowed: boolean,
    isDestroyable: boolean
}

export class Game{

    id: string
    gameManager: GameManager

    config: GameConfig

    world: p.World
    gameScale = 4
    contactEvents: ContactEvents

    players: Player[]
    enemies: Enemy[]
    projectiles: Projectile[]
    
    projectileBodys: p.Body[]
    entityBodys: p.Body[]

    inputData: Map<string, InputData[]>
    mapSetup: MapSetup

    constructor(gameManager: GameManager, id: string, config: GameConfig){
        this.gameManager = gameManager
        this.id = id

        this.config = config

        this.world = new p.World()

        this.contactEvents = new ContactEvents(this.world)

        this.inputData = new Map()

        this.players = [];
        this.enemies = [];
        this.projectiles = []

        this.projectileBodys = []
        this.entityBodys = [];

        this.mapSetup = new MapSetup(this, config.mapId)

        
        this.addHitbox(this.projectileBodys, this.entityBodys)
    }

    addHitbox(sourceBody: p.Body | p.Body[], targetBody: p.Body | p.Body[]){
        this.contactEvents.addEvent(sourceBody, targetBody, (bodyA, bodyB) => {
            const weapon = bodyA.getUserData() as BaseItem | Projectile
            const parent = weapon.parentBody.getUserData() 
            const target = bodyB.getUserData()

            const isPlayer = (obj: any) => obj instanceof Player
            const isEnemy = (obj: any) => obj instanceof Enemy

            const hit = () => {
                if(!isEnemy(target) && !isPlayer(target)) return;
                if (weapon.attackDir.length() > 0) {
                    if(weapon instanceof Projectile && !weapon.config.isPenetrating){
                        weapon.destroy()
                    }

                    target.health -= weapon.damage;
                    target.knockback = weapon.knockback;
                    target.knockbackDir = new p.Vec2(weapon.attackDir.x, weapon.attackDir.y);
                }
            }
            
            if(isPlayer(parent) && isPlayer(target)){
                if(target.uid == parent.uid) return
                if(target.isPvpProtected || !this.config.isPvpAllowed) return

                hit()
            }
            else if((isPlayer(parent) && isEnemy(target)) || (isEnemy(parent) && isPlayer(target))){
                hit()
                if(isEnemy(target) && isPlayer(parent)){
                    if(!target.attacker.includes(parent)){
                        target.attacker.push(parent)
                    }
                }
            }
        })
    }

    update(deltaTime: number) {
        this.world.step(deltaTime);
        
        // Update entitas
        this.players.forEach(player => {
            const inputData = this.inputData.get(player.uid)?.splice(0, this.inputData.get(player.uid)?.length!-1 || 2)

            if(!inputData) return;
            // if(inputData.length > 20) {
            //     this.gameManager.io.sockets.sockets.get(player.id)?.disconnect(true)
            // }

            const dir = new p.Vec2()
            const attackDir = new p.Vec2()

            inputData?.forEach(v => {
                const idir = new p.Vec2(v.dir.x || 0, v.dir.y || 0)

                if((v.attackDir.x != 0 || v.attackDir.y != 0) && player.itemInstance.timestamp < Date.now()){
                    attackDir.x = v.attackDir.x
                    attackDir.y = v.attackDir.y
                }

                dir.x += idir.x
                dir.y += idir.y
            }) 

            dir.normalize()
            dir.mul(player.speed)

            if(dir) player.pBody.setLinearVelocity(dir)
            if(attackDir && player.itemInstance.canUse()) player.attackDir = attackDir
        });

        this.broadcastOutput()

        this.players.forEach(player => {
            if(player.health <= 0){
                player.account.health = 100
                this.removePlayer(player.uid)

                if(this.id.split(':')[0] == 'duel') this.players.forEach(player2 => {
                    player2.account.health = 100
                    this.world.queueUpdate(() => {
                        this.gameManager.playerChangeWorld.set(player2.uid, 'map1')
                        this.gameManager.io.to(player2.uid).emit('changeWorld', null, 'map1', false, 0)
                    })
                })
            }
            else player.update()
        })

        this.enemies.forEach(enemy => {
            if(enemy.health <= 0){
                const { x, y } = enemy.defaultPos.clone()

                this.entityBodys.splice(this.entityBodys.indexOf(enemy.pBody), 1)
                this.enemies.splice(this.enemies.indexOf(enemy), 1)
                enemy.destroy()

                enemy.attacker.forEach(player => {
                    player.questInProgress?.addProgress('kill', enemy.id)
                })

                setTimeout(() => {
                    const newEnemy = new Enemy(this, x*this.gameScale*32, y*this.gameScale*32, enemy.id)
                    this.entityBodys.push(newEnemy.pBody)
                    this.enemies.push(newEnemy)
                }, 5000)
            }
            else enemy.update()
        })

        this.enemies.sort((a) => a.pBody.isActive() ? 1 : -1);
        this.enemies.slice().reverse().forEach(v =>{
            if(!v.pBody.isActive()){
                this.enemies.splice(this.enemies.indexOf(v), 1)
            }
        })

        this.projectiles.forEach(v => {
            v.update()
        })
    }

    broadcastOutput(){
        const gameState = {
            id: this.id,
            mapId: this.config.mapId,
            players: this.players.map(v => {
                return {
                    uid: v.uid,
                    pos: v.pBody.getPosition(),
                    attackDir: v.attackDir,
                    health: v.health,
                    timestamp: Date.now(),
                    isPvpProtected: v.isPvpProtected
                }
            }),
            enemies: this.enemies.map(v => {
                return {
                    id: v.id,
                    uid: v.uid,
                    pos: v.pBody.getPosition(),
                    attackDir: v.attackDir,
                    health: v.health
                }
            }),
            projectiles: this.projectiles.map(v => {
                return {
                    uid: v.uid,
                    pos: v.pBody.getPosition(),
                    dir: v.attackDir,
                    config: v.config
                }
            })
        }

        this.gameManager.io.to(this.id).emit('output', gameState)
    }

    addPlayer(uid: string, account: Account, from?: string){
        const enterPos = this.mapSetup.enterpoint.get(from || 'spawn') || { x: 100, y: 100 }

        const player = new Player(this, enterPos.x, enterPos.y, uid, account)
        player.magicBook.changeBook(account.magicBook)
        player.equipItem(0)

        if(this.config.isPvpAllowed){
            player.isPvpProtected = true
            setTimeout(() => {
                if(player) player.isPvpProtected = false
            }, 5000)
        }

        if(account.questInProgress){
            const questId = account.questInProgress[0]
            const quest = Quests.getQuestByQuestId(questId)
            player.questInProgress = quest
            
            if(player.questInProgress && quest){
                quest.onProgress((taskProgress) => {
                    player.account.questInProgress = [questId, taskProgress]
                    socket?.emit('questProgress', quest.config.taskInstruction, taskProgress.map((v, i) => {
                        return {
                            type: quest.config.task[i].type,
                            target: quest.config.task[i].target,
                            progress: v,
                            max: quest.config.task[i].amount
                        }
                    }))
                })
            }
        }

        this.entityBodys.push(player.pBody)
        this.players.push(player)

        const socket = this.gameManager.io.sockets.sockets.get(uid)

        this.gameManager.playerMap.set(uid, this.id);
        socket?.join(this.id);

        socket?.emit('joinGame', account, this.players.map(v => {
            return {
                uid: v.uid,
                username: v.account.username,
                pos: v.pBody.getPosition(),
                activeIndex: v.magicBook.activeIndex,
                health: v.health,
                outfit: v.outfit,
                magicBook: v.magicBook.id
            }
        }))
        socket?.broadcast.to(this.id).emit('playerJoined', {
            uid: socket.id,
            username: account.username,
            from: from || 'spawn',
            health: account.health,
            outfit: account.outfit
        });


        if(account.questInProgress) player.questInProgress?.setTaskProgress(account.questInProgress[1])

        console.log('Player '+uid+' has added to '+this.id)
    }

    removePlayer(uid: string){
        const existPlayer = this.players.find(player => player.uid == uid)

        if(!existPlayer) return

        this.gameManager.playerMap.delete(uid);

        this.players.splice(this.players.indexOf(existPlayer), 1)
        this.entityBodys.splice(this.entityBodys.indexOf(existPlayer.pBody), 1)

        existPlayer.destroy()

        this.gameManager.io.to(this.id).emit('playerLeft', uid);
        
        const socket = this.gameManager.io.sockets.sockets.get(uid)
        socket?.leave(this.id)

        if(this.id.split(':')[0] == 'duel' && this.players.length <= 0){
            this.destroy()
        }
        
        console.log('Player '+uid+' has removed from '+this.id)
    }

    destroy(){
        this.players.forEach(v => {
            v.destroy()
        })
        this.enemies.forEach(v => {
            v.destroy()
        })
        this.projectiles.forEach(v => {
            v.destroy()
        })

        const allBody: p.Body[] = []
        for(let body = this.world.getBodyList(); body; body = body.getNext()){
            allBody.push(body)
        }
        allBody.forEach(body => this.world.destroyBody(body))

        this.gameManager.worlds.splice(this.gameManager.worlds.indexOf(this), 1)
    }
}