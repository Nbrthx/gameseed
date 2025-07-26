import { Server, Socket } from 'socket.io';
import { GameManager, InputData } from './GameManager';
import { Server as HTTPServer } from 'http'
import { Account, Item } from './server';
// import { QuestConfig, Quests } from './components/Quests';

interface OutfitList {
    male: {
        hair: string[],
        face: string[],
        body: string[],
        leg: string[]
    },
    female: {
        hair: string[],
        face: string[],
        body: string[],
        leg: string[]
    }
}

const outfitList: OutfitList = {
    male: {
        hair: [],
        face: [],
        body: [],
        leg: []
    },
    female: {
        hair: [],
        face: [],
        body: [],
        leg: []
    }
}

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

            // this.gameManager.getPlayerWorld(socket.id)?.removePlayer(socket.id);
            // this.removeAuthedId(socket.id)
        });
    }
}