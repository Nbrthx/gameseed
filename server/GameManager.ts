import { Server } from "socket.io";
import { Game, GameConfig } from "./GameWorld";

export interface InputData {
    dir: { x: number, y: number }
    attackDir: { x: number, y: number }
}

const maps: {
    id: string
    config: GameConfig
}[] = [
    {
        id: 'map1',
        config: {
            mapId: 'map1',
            isPvpAllowed: false,
            requiredLevel: 0,
            isDestroyable: false
        }
    }
]

export class GameManager{
    
    worlds: Game[]
    io: Server;

    playerMap: Map<string, string>;
    playerChangeWorld: Map<string, string>
    duelRequest: Map<string, string>

    constructor(io: Server) {
        this.worlds = [];
        this.io = io
        
        this.playerMap = new Map();
        this.playerChangeWorld = new Map()
        this.duelRequest = new Map()

        maps.forEach(map => {
            this.createWorld(map.id, map.config)
        })

        setInterval(() => {
            this.update();
        }, 1000 / 60);
    }

    public createWorld(worldId: string, config: GameConfig){
        this.worlds.push(new Game(this, worldId, config))
    }

    public getWorld(worldId: string){
        return this.worlds.find(world => world.id == worldId)
    }

    public getPlayerWorld(playerId: string){
        return this.getWorld(this.playerMap.get(playerId) || '')
    }

    public handleInput(uid: string, input: InputData){
        const world = this.getPlayerWorld(uid)

        if(!world) return
        if(!world.players.find(player => player.uid == uid)) return

        if(!world.inputData.has(uid)) world.inputData.set(uid, [])
        world.inputData.get(uid)?.push(input)
    }

    update() {
        this.worlds.forEach((world) => {
            world.update(1/60);
        });
    }
    
}