import { Game } from '../GameWorld'
import * as p from 'planck'
import { Account } from '../server'
import { BaseItem } from './BaseItem'
import { ItemInstance } from './ItemInstance'
// import { MeleeWeapon } from './items/MeleeWeapon'
import { Quest } from '../components/Quests'
import { MagicBook } from './MagicBook'
import { MeleeWeapon } from './items/MeleeWeapon'

export class Player{

    account: Account

    uid: string
    health: number
    maxHealth: number
    speed = 3.6

    scene: Game
    pBody: p.Body
    itemInstance: BaseItem
    
    attackDir: p.Vec2
    force: number
    forceDir: p.Vec2
    knockback: number
    knockbackDir: p.Vec2

    magicBook: MagicBook
    outfit: {
        isMale: boolean
        hair: string
        face: string
        body: string
        leg: string
    }
    questInProgress: Quest | null = null
    isPvpProtected: boolean

    constructor(scene: Game, x: number, y: number, uid: string, account: Account){
        this.scene = scene
        this.uid = uid
        this.account = account

        this.pBody = scene.world.createDynamicBody({
            position: new p.Vec2(x/scene.gameScale/32, y/scene.gameScale/32),
            fixedRotation: true
        })
        this.pBody.createFixture({
            shape: new p.Box(0.24, 0.3, new p.Vec2(0, 0.2)),
            filterCategoryBits: 2,
            filterMaskBits: 1,
        })
        this.pBody.setUserData(this)
        
        this.outfit = account.outfit

        this.maxHealth = 100
        this.health = account.health || this.maxHealth

        this.magicBook = new MagicBook('warrior')

        this.itemInstance = new ItemInstance(scene, this.pBody).itemInstance
        this.attackDir = new p.Vec2(0, 0)

        this.force = 0
        this.forceDir = new p.Vec2(0, 0)

        this.knockback = 0
        this.knockbackDir = new p.Vec2(0, 0)

        this.isPvpProtected = false
    }

    update(){
        if(this.attackDir.length() > 0){
            this.itemInstance.use(this.attackDir.x, this.attackDir.y)

            this.magicBook.refreshTimestamp()

            this.attackDir = new p.Vec2(0, 0)
        }

        this.account.health = this.health

        if(!this.itemInstance.canMove){
           if(this.itemInstance.isAttacking) this.pBody.setLinearVelocity(new p.Vec2(0, 0))
        }

        if(this.knockback > 1 || this.knockback < -1){
            const dir = this.knockbackDir.clone()
            dir.normalize()
            dir.mul(this.knockback)
            this.pBody.applyLinearImpulse(dir, this.pBody.getWorldCenter())
            if(this.knockback > 0) this.knockback -= 2
            else this.knockback += 2
        }
        else if(this.force > 1 || this.force < -1){
            const dir = this.forceDir.clone()
            dir.normalize()
            dir.mul(this.force)
            this.pBody.applyLinearImpulse(dir, this.pBody.getWorldCenter())
            if(this.force > 0) this.force -= 2
            else this.force += 2
        }

        this.healWhenInArea()
    }

    healWhenInArea(){
        for(let ce = this.pBody.getContactList(); ce; ce = ce.next){
            const contact = ce.contact
            const bodyAData = contact.getFixtureA().getBody().getUserData()
            const bodyBData = contact.getFixtureB().getBody().getUserData()
            if(typeof bodyAData == 'string' && bodyAData == 'heal' || typeof bodyBData == 'string' && bodyBData == 'heal'){
                this.health += 0.05
                if(this.health > this.maxHealth) this.health = this.maxHealth
                return
            }
        }
    }

    equipItem(index: number){
        this.magicBook.activeIndex = index
        this.scene.world.queueUpdate(() => {
            let skill = this.magicBook.skills[index]

            if(this.itemInstance){
                const timestamp = skill.timestamp
                this.magicBook.setTimestamp(this.magicBook.activeIndex, timestamp)
                this.itemInstance.destroy()
            }

            const newItemInstance = new ItemInstance(this.scene, this.pBody, skill.id).itemInstance
            newItemInstance.timestamp = skill.timestamp
            if(newItemInstance instanceof MeleeWeapon){
                this.scene.addHitbox(newItemInstance.hitbox, this.scene.entityBodys)
            }

            this.itemInstance = newItemInstance
        })
    }

    destroy(){
        this.scene.world.destroyBody(this.pBody)
        this.scene.contactEvents.destroyEventByBody(this.pBody)
        this.itemInstance.destroy()
        this.questInProgress?.destroy()
    }
}