import { Server, Socket } from 'socket.io';
import { GameManager, InputData } from './GameManager';
import { Server as HTTPServer } from 'http'
import { Account } from './server';
// import { QuestConfig, Quests } from './components/Quests';

// interface OutfitList {
//     male: {
//         hair: string[],
//         face: string[],
//         body: string[],
//         leg: string[]
//     },
//     female: {
//         hair: string[],
//         face: string[],
//         body: string[],
//         leg: string[]
//     }
// }

// const outfitList: OutfitList = {
//     male: {
//         hair: [],
//         face: [],
//         body: [],
//         leg: []
//     },
//     female: {
//         hair: [],
//         face: [],
//         body: [],
//         leg: []
//     }
// }

export class SocketManager {

    private io: Server;
    private gameManager: GameManager;
    private accounts: Account[];
    private authedId: Map<string, string>;

    constructor(server: HTTPServer, accounts: Account[], authedId: Map<string, string>) {
        this.io = new Server(server);
        this.gameManager = new GameManager(this.io);
        this.accounts = accounts
        this.authedId = authedId

        this.io.on('connection', this.setupSocketListeners.bind(this))
    }

    private setupSocketListeners(socket: Socket): void {

        socket.on('joinGame', this.joinGame.bind(this, socket));

        socket.on('playerInput', this.playerInput.bind(this, socket));

        socket.on('changeSkill', this.changeSkill.bind(this, socket));

        socket.on('confirmChangeWorld', this.confirmChangeWorld.bind(this, socket));

        socket.on('changeBook', this.changeBook.bind(this, socket));

        socket.on('ping', (callback) => {
            callback()
        })

        socket.on('disconnect', () => {
            // const tradeSession = this.gameManager.tradeSession.find(v => v.player1 == socket.id || v.player2 == socket.id)
            // if(tradeSession){
            //     this.io.to(tradeSession.player1).emit('tradeEnd')
            //     this.io.to(tradeSession.player2).emit('tradeEnd')
            //     this.gameManager.tradeSession.splice(this.gameManager.tradeSession.indexOf(tradeSession), 1)
            // }

            this.gameManager.getPlayerWorld(socket.id)?.removePlayer(socket.id);
            this.removeAuthedId(socket.id)
        });
    }

    joinGame(socket: Socket){
        const account = this.getAccountData(socket.id)
        if(!account) return

        const world = this.gameManager.getWorld('map1')
        world?.addPlayer(socket.id, account);
    }

    playerInput(socket: Socket, input: InputData){
        if(!input) return
        if(typeof input.dir.x !== 'number' && typeof input.dir.y !== 'number') return
        if(typeof input.attackDir.x !== 'number' && typeof input.attackDir.y !== 'number') return

        this.gameManager.handleInput(socket.id, input);
    }

    changeSkill(socket: Socket, index: number){
        const player = this.getPlayer(socket.id)
        if(!player) return
        if(index < 0 || index > 4) return

        player.equipItem(index)
        socket.broadcast.to(player.scene.id).emit('otherSkillUpdate', socket.id, index)
    }
    
    confirmChangeWorld(socket: Socket){
        const player = this.getPlayer(socket.id)
        if(!player) return

        const worldId = this.gameManager.playerChangeWorld.get(socket.id)
        if(!worldId) return

        const world = this.gameManager.getWorld(worldId)
        if(!world) return

        player.scene.removePlayer(socket.id)
        world.addPlayer(socket.id, player.account, player.scene.id.split(':')[0] == 'duel' ? 'spawn' : player.scene.id)

        this.gameManager.playerChangeWorld.delete(socket.id)
    }

    changeBook(socket: Socket, id: string){
        const player = this.getPlayer(socket.id)
        if(!player) return

        player.magicBook.changeBook(id)
        player.equipItem(0)

        socket.broadcast.to(player.scene.id).emit('otherBookUpdate', socket.id, id)
    }

    // Not Listener

    getPlayer(id: string){
        return this.gameManager.getPlayerWorld(id)?.players.find(v => v.uid == id)
    }

    getIdByUsername(username: string){
        let id: string | null = null
        this.authedId.forEach((v, k) => {
            if(v == username){
                id = k
                return
            }
        })
        return id
    }

    getAccountData(id: string){
        if(!this.authedId.has(id)) return null

        const username = this.authedId.get(id) as string

        return this.accounts.find(v => v.username == username)
    }

    removeAuthedId(id: string){
        if(!this.authedId.has(id)) return
        this.authedId.delete(id)
    }
}