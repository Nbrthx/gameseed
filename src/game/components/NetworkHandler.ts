import { Socket } from "socket.io-client"
import { Game } from "../scenes/Game"
import { isMobile } from "../scenes/GameUI"
import { Player } from "../prefabs/Player"

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
        // config: ProjectileConfig
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

        this.socket.emit('joinGame')

        this.socket.on('joinGame', this.joinGame.bind(this))

        this.socket.on('playerJoined', this.playerJoined.bind(this))

        this.socket.on('playerLeft', this.playerLeft.bind(this))
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
    }[]){
        const scene = this.scene
        
        console.log(account)
        if(account) this.isAuthed = true

        // scene.player.syncData(account.health, account.inventory, 0, account.outfit)

        // scene.UI.setupUI(scene.player)

        others.forEach(v => {
            if(v.uid == this.socket.id) return
            console.log(v.uid)

            const other = new Player(scene, v.pos.x*scene.gameScale*32, v.pos.y*scene.gameScale*32, v.uid, v.username)
            // other.syncData(v.health, v.items, v.activeIndex, v.outfit)

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
}