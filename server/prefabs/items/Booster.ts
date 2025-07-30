import * as p from "planck";
import { Game } from "../../GameWorld";
import { BaseItem } from "../BaseItem";
import { Player } from "../Player";

interface Heal{
    effect: 'heal'
    amount: number
}

export interface Boost{
    texture: string
    effect: Heal
    cooldown: number
}

export class Booster extends BaseItem{

    config: Boost
    attackState: boolean;

    constructor(scene: Game, parentBody: p.Body, config: Boost){
        super(scene, parentBody);
        
        this.config = config
        
        this.attackState = false
        this.timestamp = 0
        this.cooldown = config.cooldown
    }

    use(x: number, y: number){
        if(!this.canUse()) return

        this.timestamp = Date.now()

        this.attackState = !this.attackState
        this.attackDir = new p.Vec2(x, y)

        const parent = this.parentBody.getUserData() as Player

        if(this.config.effect.effect === 'heal'){
            parent.health += this.config.effect.amount
            if(parent.health > parent.maxHealth) parent.health = parent.maxHealth
        }

    }

    destroy(){
        //
    }
}