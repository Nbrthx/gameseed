import { Server, Socket } from 'socket.io';
import { GameManager, InputData } from './GameManager';
import { Server as HTTPServer } from 'http'
import { Account } from './server';
import { QuestConfig, Quests } from './components/Quests';
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

        socket.on('getQuestData', this.getQuestData.bind(this, socket));

        socket.on('acceptQuest', this.acceptQuest.bind(this, socket));

        socket.on('declineQuest', this.declineQuest.bind(this, socket));

        socket.on('completeQuest', this.completeQuest.bind(this, socket));

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
        if(index < 0 || index > 3) return

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
        player.account.magicBook = id

        socket.broadcast.to(player.scene.id).emit('otherBookUpdate', socket.id, id)
    }

    getQuestData(socket: Socket, npcId: string, callback: (quest: QuestConfig | QuestConfig[], haveOtherQuest: string, progressState: number) => void) {
        if(typeof npcId !== 'string') return

        const player = this.getPlayer(socket.id)
        if(!player) return

        const quest = Quests.isNpcQuestRepeatable(npcId) ? Quests.getQuestsByNpcId(npcId) : Quests.getQuestByNpcId(npcId, player.account.questCompleted)
        if(!quest) return callback({
            id: '',
            npcId: '',
            name: '',
            description: '',
            reward: {},
            taskInstruction: '',
            task: []
        }, '', 0)

        let progressState = 0

        if(player.questInProgress && !Array.isArray(quest)){
            progressState = player.questInProgress.config.id === quest.config.id ?
                (player.questInProgress.isComplete ? 2 : 1) : 0;
        }
        else if(Array.isArray(quest)){
            for(const q of quest){
                if(player.questInProgress && player.questInProgress.config.id === q.config.id){
                    progressState = player.questInProgress.isComplete ? 2 : 1
                    break
                }
            }
        }

        if(!Array.isArray(quest)) callback(quest.config, player.questInProgress?.config.id || '', progressState)
        else callback(quest.map(v => v.config), player.questInProgress?.config.id || '', progressState)
    }

    acceptQuest(socket: Socket, npcId: string, questId?: string) {
        if(typeof npcId !== 'string') return

        const player = this.getPlayer(socket.id)
        if(!player) return

        const quest = questId ? Quests.getQuestByQuestId(questId) : Quests.getQuestByNpcId(npcId, player.account.questCompleted)
        if(!quest) return

        console.log('Quest accepted:', quest.config.id)

        player.questInProgress = quest
        player.account.questInProgress = [quest.config.id, quest.taskProgress]

        quest.onProgress((taskProgress) => {
            player.account.questInProgress = [quest.config.id, taskProgress]
            socket.emit('questProgress', quest.config.taskInstruction, taskProgress.map((v, i) => {
                return {
                    type: quest.config.task[i].type,
                    target: quest.config.task[i].target,
                    progress: v,
                    max: quest.config.task[i].amount
                }
            }))
            console.log('Quest progress:', taskProgress) // Debugging line
        })

        quest.setTaskProgress(quest.taskProgress)
    }

    declineQuest(socket: Socket){
        const player = this.getPlayer(socket.id)
        if(!player || !player.questInProgress) return

        player.questInProgress.destroy()
        player.questInProgress = null
        player.account.questInProgress = undefined

        socket.emit('questProgress', 'No instruction yet')
    }

    completeQuest(socket: Socket) {
        const player = this.getPlayer(socket.id)
        if(!player || !player.questInProgress) return

        const quest = player.questInProgress
        
        if(quest && quest.isComplete){
            const { book } = quest.config.reward

            player.account.questCompleted.push(quest.config.id);
            
            if(book){
                player.account.ownedBooks = player.account.ownedBooks.filter(v => v != book)
                player.account.ownedBooks.push(book)
                socket.emit('ownedBooksUpdate', player.account.ownedBooks)
            }

            player.questInProgress.destroy()
            player.questInProgress = null
            player.account.questInProgress = undefined
            
            socket.emit('questProgress', 'No instruction yet')
        }
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