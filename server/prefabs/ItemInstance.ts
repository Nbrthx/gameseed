import * as p from 'planck'
import { Game } from "../GameWorld";
import { BaseItem } from "./BaseItem";
import { MeleeWeapon, Melee } from "./items/MeleeWeapon";
import { RangeWeapon, Range } from "./items/RangeWeapon";
import { Boost, Booster } from './items/Booster';

interface MeleeItem {
    id: string
    type: 'melee'
    config: Melee
}

interface RangeItem {
    id: string
    type: 'range'
    config: Range
}

interface BoostItem {
    id: string
    type: 'boost'
    config: Boost
}

type Item = MeleeItem | RangeItem | BoostItem

export const itemList: Item[] = [
    {
        "id": "punch",
        "type": "melee",
        "config": {
            "texture": "punch",
            "offsetMultipler": 1,
            "hitbox": {
                "shape": "box",
                "width": 0.7,
                "height": 0.2
            },
            "hitboxOffsetMultipler": 1.1,
            "cooldown": 500,
            "attackDelay": 100,
            "damage": 2,
            "knockback": 15,
            "force": 6,
            "forceDelay": 0,
            "canMove": true
        }
    },
    {
        "id": "shot",
        "type": "range",
        "config": {
            "texture": "throw",
            "projectileTexture": "bullet",
            "spriteOffsetMultipler": 0.9,
            "offsetMultipler": 0.8,
            "hitboxSize": {
                "width": 0.2,
                "height": 0.2
            },
            "speed": 20,
            "range": 5,
            "cooldown": 500,
            "attackDelay": 100,
            "damage": 1.5,
            "knockback": 8,
            "force": -4,
            "forceDelay": 0,
            "isPenetrating": false,
            "canMove": true
        }
    },
    {
        "id": "sword",
        "type": "melee",
        "config": {
            "texture": "sword",
            "offsetMultipler": 0.5,
            "hitbox": {
                "shape": "box",
                "width": 0.8,
                "height": 0.7
            },
            "hitboxOffsetMultipler": 0.9,
            "cooldown": 1600,
            "attackDelay": 200,
            "damage": 5.5,
            "knockback": 20,
            "force": 10,
            "forceDelay": 0,
            "canMove": true
        }
    },
    {
        "id": "sword2",
        "type": "melee",
        "config": {
            "texture": "sword2",
            "offsetMultipler": 1,
            "hitbox": {
                "shape": "box",
                "width": 1.1,
                "height": 0.6
            },
            "hitboxOffsetMultipler": 1.2,
            "cooldown": 3000,
            "attackDelay": 200,
            "damage": 5.5,
            "knockback": 18,
            "force": 14,
            "forceDelay": 100,
            "canMove": true
        }
    },
    {
        "id": "sword3",
        "type": "melee",
        "config": {
            "texture": "sword3",
            "offsetMultipler": 0,
            "hitbox": {
                "shape": "circle",
                "radius": 1.8
            },
            "hitboxOffsetMultipler": 0,
            "cooldown": 2000,
            "attackDelay": 200,
            "damage": 5,
            "knockback": -8,
            "force": 18,
            "forceDelay": 0,
            "canMove": true
        }
    },
    {
        "id": "fire-burst",
        "type": "melee",
        "config": {
            "texture": "fire-burst",
            "offsetMultipler": 2,
            "hitbox": {
                "shape": "polygon",
                "vertices": [
                    { "x": -2, "y": 0 },
                    { "x": 1.2, "y": 1.5 },
                    { "x": 1.2, "y": -1.5 },
                ]
            },
            "hitboxOffsetMultipler": 2.4,
            "cooldown": 4000,
            "attackDelay": 200,
            "damage": 5,
            "knockback": 16,
            "force": -10,
            "forceDelay": 0,
            "canMove": false
        }
    },
    {
        "id": "fire-burst2",
        "type": "melee",
        "config": {
            "texture": "fire-burst2",
            "offsetMultipler": 3.6,
            "hitbox": {
                "shape": "box",
                "width": 3,
                "height": 0.5
            },
            "hitboxOffsetMultipler": 3.6,
            "cooldown": 10000,
            "attackDelay": 0,
            "damage": 12,
            "knockback": 26,
            "force": -10,
            "forceDelay": 0,
            "canMove": true
        }
    },
    {
        "id": "bow",
        "type": "range",
        "config": {
            "texture": "bow",
            "projectileTexture": "arrow",
            "spriteOffsetMultipler": 0.8,
            "offsetMultipler": 0.8,
            "hitboxSize": {
                "width": 0.4,
                "height": 0.1
            },
            "speed": 30,
            "range": 6,
            "cooldown": 2000,
            "attackDelay": 200,
            "damage": 5,
            "knockback": 20,
            "force": -8,
            "forceDelay": 100,
            "isPenetrating": false,
            "canMove": false
        }
    },

    {
        "id": "bow2",
        "type": "range",
        "config": {
            "texture": "bow",
            "projectileTexture": "big-arrow",
            "spriteOffsetMultipler": 0.8,
            "offsetMultipler": 0.8,
            "hitboxSize": {
                "width": 0.4,
                "height": 0.2
            },
            "speed": 25,
            "range": 6,
            "cooldown": 8000,
            "attackDelay": 200,
            "damage": 10,
            "knockback": 22,
            "force": -16,
            "forceDelay": 100,
            "isPenetrating": false,
            "canMove": false
        }
    },
    {
        "id": "dagger",
        "type": "melee",
        "config": {
            "texture": "dagger",
            "offsetMultipler": 0.2,
            "hitbox": {
                "shape": "box",
                "width": 1.4,
                "height": 0.4
            },
            "hitboxOffsetMultipler": 0.4,
            "cooldown": 7000,
            "attackDelay": 300,
            "damage": 10,
            "knockback": 8,
            "force": 24,
            "forceDelay": 200,
            "canMove": false
        }
    },
    {
        "id": "blue-knife",
        "type": "range",
        "config": {
            "texture": "throw",
            "projectileTexture": "blue-knife",
            "spriteOffsetMultipler": 0.9,
            "offsetMultipler": 0.7,
            "hitboxSize": {
                "width": 0.2,
                "height": 0.1
            },
            "speed": 10,
            "range": 8,
            "cooldown": 500,
            "attackDelay": 200,
            "damage": 1.6,
            "knockback": 10,
            "force": -10,
            "forceDelay": 200,
            "isPenetrating": true,
            "canMove": true
        }
    },
    {
        "id": "fireball",
        "type": "range",
        "config": {
            "texture": "throw",
            "projectileTexture": "fireball",
            "spriteOffsetMultipler": 0.9,
            "offsetMultipler": 0.7,
            "hitboxSize": {
                "width": 0.2,
                "height": 0.2
            },
            "speed": 15,
            "range": 7,
            "cooldown": 2000,
            "attackDelay": 100,
            "damage": 4,
            "knockback": 10,
            "force": -8,
            "forceDelay": 100,
            "isPenetrating": false,
            "canMove": true
        }
    },
    {
        "id": "puller",
        "type": "range",
        "config": {
            "texture": "throw",
            "projectileTexture": "puller",
            "spriteOffsetMultipler": 0.9,
            "offsetMultipler": 0.7,
            "hitboxSize": {
                "width": 0.2,
                "height": 0.2
            },
            "speed": 20,
            "range": 7,
            "cooldown": 8000,
            "attackDelay": 100,
            "damage": 7,
            "knockback": -16,
            "force": 14,
            "forceDelay": 100,
            "isPenetrating": false,
            "canMove": true
        }
    },
    {
        "id": "healing",
        "type": "boost",
        "config": {
            "texture": "healing",
            "effect": {
                "effect": "heal",
                "amount": 8
            },
            "cooldown": 4000,
        }
    },
    {
        "id": "healing2",
        "type": "boost",
        "config": {
            "texture": "healing",
            "effect": {
                "effect": "heal",
                "amount": 16
            },
            "cooldown": 6000,
        }
    }
]

export type BaseItemConfig = Melee | Range | Boost;

export class ItemInstance{

    scene: Game;
    parentBody: p.Body;
    itemInstance: BaseItem

    constructor(scene: Game, parentBody: p.Body, itemId?: string){
        this.scene = scene;
        this.parentBody = parentBody;

        const defaultConfig = itemList[0].config as Melee;
        const item = itemList.find(item => item.id === itemId?.split(':')[0] || '');

        if(item && itemId){
            if(item.type === 'melee'){
                this.itemInstance = new MeleeWeapon(this.scene, this.parentBody, item.config);
            }
            else if(item.type === 'range'){
                this.itemInstance = new RangeWeapon(this.scene, this.parentBody, item.config);
            }
            else if(item.type === 'boost'){
                this.itemInstance = new Booster(this.scene, this.parentBody, item.config);
            }
            else{
                this.itemInstance = new MeleeWeapon(this.scene, this.parentBody, defaultConfig);
            }
        }
        else{
            this.itemInstance = new MeleeWeapon(this.scene, this.parentBody, defaultConfig);
        }
    }
}