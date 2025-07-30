import * as p from "planck";
import { Game } from "../../GameWorld";
import { BaseItem } from "../BaseItem";

interface Hitbox{
    shape: 'box'
    width: number
    height: number
}

interface Hitcircle{
    shape: 'circle'
    radius: number
}

interface Hitpolygon{
    shape: 'polygon'
    vertices: { x: number, y: number }[]
}

export interface Melee{
    texture: string
    offsetMultipler: number
    hitbox: Hitbox | Hitcircle | Hitpolygon
    hitboxOffsetMultipler: number
    cooldown: number
    attackDelay: number
    damage: number
    knockback: number
    force: number
    forceDelay: number
    canMove: boolean
}

export class MeleeWeapon extends BaseItem{

    config: Melee
    hitbox: p.Body;
    attackState: boolean;

    constructor(scene: Game, parentBody: p.Body, config: Melee){
        super(scene, parentBody);
        
        this.config = config
        this.damage = config.damage
        this.knockback = config.knockback
        this.canMove = config.canMove
        
        this.attackState = false

        this.hitbox = scene.world.createKinematicBody();

        const hitboxShape = config.hitbox.shape === 'polygon' ? new p.Polygon(config.hitbox.vertices) :
            config.hitbox.shape === 'circle' ? new p.Circle(new p.Vec2(0, 0), config.hitbox.radius) :
            new p.Box(config.hitbox.width, config.hitbox.height)

        this.hitbox.createFixture({
            shape: hitboxShape,
            isSensor: true
        })
        this.hitbox.setActive(false); // Nonaktifkan awal
        this.hitbox.setUserData(this)

        this.timestamp = 0
        this.cooldown = config.cooldown
    }

    use(x: number, y: number){
        if(!this.canUse()) return
        if(this.isAttacking) return
        this.isAttacking = true

        this.timestamp = Date.now()

        this.attackState = !this.attackState
        this.attackDir = new p.Vec2(x, y)

        setTimeout(() => this.parentForce(x, y), this.config.forceDelay)

        const rad = Math.atan2(y, x)

        setTimeout(() => {
            this.hitbox.setPosition(
                new p.Vec2(
                    (this.parentBody.getPosition().x + Math.cos(rad) * this.config.hitboxOffsetMultipler),
                    (this.parentBody.getPosition().y + 0.1 + Math.sin(rad) * this.config.hitboxOffsetMultipler)
                )
            );
            this.hitbox.setAngle(rad)
            this.hitbox.setActive(true)
            
            setTimeout(() => {
                this.isAttacking = false
                this.hitbox.setActive(false)
            }, 100)
        }, this.config.attackDelay)
    }

    parentForce(x: number, y: number){
        const dir = new p.Vec2(x, y)
        dir.normalize()

        const parent = this.parentBody.getUserData() as { force?: number, forceDir?: p.Vec2 }
        parent.forceDir = dir
        parent.force = this.config.force
        this.parentBody.applyLinearImpulse(dir, this.parentBody.getWorldCenter())
    }

    destroy(){
        this.scene.contactEvents.destroyEventByBody(this.hitbox)
        this.hitbox.getWorld().queueUpdate(world => {
            world.destroyBody(this.hitbox)
        })
    }
}