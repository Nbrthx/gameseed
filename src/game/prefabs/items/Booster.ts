import p from "planck";
import { Game } from "../../scenes/Game";
import { BaseItem } from "../BaseItem";
import { SpatialSound } from "../../components/SpatialAudio";

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
    useSound: SpatialSound
    attackState: boolean;

    constructor(scene: Game, parentBody: p.Body, config: Boost){
        super(scene, parentBody);
        
        scene.add.existing(this);

        this.config = config
        this.canMove = true
        this.attackDelay = 0
        
        this.attackState = false

        this.sprite = scene.add.sprite(0, 0, config.texture)
        this.sprite.setScale(4)
        this.sprite.setVisible(false)

        this.useSound = scene.spatialAudio.addSound('audio-'+config.texture)

        this.timestamp = 0
        this.cooldown = config.cooldown

        this.add(this.sprite)
    }

    use(x: number, y: number){
        this.timestamp = Date.now()

        this.sprite.setFlipY(this.attackState)
        // this.attackState = !this.attackState

        this.sprite.play(this.config.texture+'-attack')
        this.sprite.setVisible(true)
        
        const audioPos = this.parentBody.getPosition()
        this.useSound.playSound(audioPos.x+x, audioPos.y+y, true, false)

        this.sprite.once('animationcomplete', () => {
            this.sprite.setVisible(false)
        })
    }

    destroy(){
        super.destroy()
    }
}