import { Game } from '../scenes/Game'
import p from 'planck'
import { BaseItem } from './BaseItem'
import { ItemInstance } from './ItemInstance'
import { SpatialSound } from '../components/SpatialAudio'
import { TextBox } from './TextBox'
import { MagicBook } from './MagicBook'
import { MeleeWeapon } from './items/MeleeWeapon'
import { RangeWeapon } from './items/RangeWeapon'

export class Player extends Phaser.GameObjects.Container{

    uid: string
    maxHealth: number
    health: number
    speed = 3.6

    scene: Game
    magicBook: MagicBook
    itemInstance: BaseItem

    sprite: Phaser.GameObjects.Sprite
    emptyBar: Phaser.GameObjects.Rectangle
    damageBar: Phaser.GameObjects.Rectangle
    healthBar: Phaser.GameObjects.Rectangle
    nameText: Phaser.GameObjects.Text
    
    username: string
    isPvpProtected: boolean

    audio?: { step: SpatialSound, hit: SpatialSound }

    pBody: p.Body
    attackDir: p.Vec2
    textbox: TextBox
    aimAssist: Phaser.GameObjects.Graphics
    itemIcon: Phaser.GameObjects.Image

    constructor(scene: Game, x: number, y: number, uid: string, username: string){
        super(scene, x, y)

        this.scene = scene
        this.uid = uid

        scene.add.existing(this)

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

        this.username = username
        this.isPvpProtected = false

        this.textbox = new TextBox(this.scene, 0, -190)

        this.maxHealth = 100
        this.health = this.maxHealth

        this.emptyBar = scene.add.rectangle(0, -130, 166, 18, 0x494449).setRounded(4)
        this.damageBar = scene.add.rectangle(0, -130, 164, 16, 0xffccaa).setRounded(4)
        this.healthBar = scene.add.rectangle(0, -130, 164, 16, 0x00aa77).setRounded(4)

        this.magicBook = new MagicBook('warrior')

        this.attackDir = new p.Vec2(0, 0)
        this.itemInstance = new ItemInstance(scene, this.pBody, 'punch').itemInstance

        this.sprite = scene.add.sprite(0, -36, 'player').setOrigin(0.5, 0.5).setScale(scene.gameScale)
        this.sprite.play('idle', true)
        this.sprite.setPipeline('Light2D')

        this.itemIcon = scene.add.image(80, 8, '').setOrigin(0.5, 0.5)
        this.itemIcon.setScale(4)
        this.itemIcon.setVisible(false)

        // this.aimAssist = scene.add.rectangle(0,12, 96, 24, 0xffffff, 0.5)
        // this.aimAssist.setOrigin(-1.5, 0.5).setVisible(false).setRounded(8)

        this.aimAssist = scene.add.graphics()
        this.aimAssist.y = 14
        
        const shadow = scene.add.image(0, 19*scene.gameScale, 'shadow').setAlpha(0.4).setScale(scene.gameScale)

        this.nameText = scene.add.text(0, -38*scene.gameScale, username, {
            fontFamily: 'PixelFont', fontSize: 24,
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setResolution(4)

        this.add([shadow, this.aimAssist, this.itemInstance, this.sprite, this.itemIcon, this.emptyBar, this.damageBar, this.healthBar, this.nameText, this.textbox])
    }

    update(){
        const vel = this.pBody.getLinearVelocity()

        if(!this.audio && this.scene.player){
            this.audio = {
                step: this.scene.spatialAudio.addSound('audio-step'),
                hit: this.scene.spatialAudio.addSound('audio-hit')
            }
            this.audio.step.sound?.setRate(1.2)
        }

        if(vel.x != 0 || vel.y != 0){
            if(vel.y > -0.1) this.sprite.play('rundown', true)
            else this.sprite.play('runup', true)
        
            if(vel.x > 0) this.sprite.setFlipX(false)
            else if(vel.x < 0) this.sprite.setFlipX(true)

            const { x, y } = this.pBody.getPosition()
            this.audio?.step.playSound(x, y)
        }
        else this.sprite.play('idle', true)

        if(this.attackDir.length() > 0){
            if(this.itemInstance) this.itemInstance.use(this.attackDir.x, this.attackDir.y)

            this.magicBook.refreshTimestamp()

            this.attackDir = new p.Vec2(0, 0)
        }

        if(this.itemInstance.sprite.anims.isPlaying){
            this.itemIcon.setAlpha(0.2)
        }
        else this.itemIcon.setAlpha(0.8)

        this.setDepth(this.y/this.scene.gameScale)

        const isReady = this.itemInstance.timestamp+this.itemInstance.config.cooldown < Date.now()

        if(this.itemInstance.canMove != isReady){
            this.itemInstance.canMove = isReady
            this.drawAimAssist(isReady)
        }

        this.x = this.pBody.getPosition().x*this.scene.gameScale*32
        this.y = this.pBody.getPosition().y*this.scene.gameScale*32

        if(this.isPvpProtected) this.sprite.setAlpha(0.7)
        else this.sprite.setAlpha(1)
        
        this.barUpdate(this.healthBar)
    }

    barUpdate(bar: Phaser.GameObjects.Rectangle){
        if(bar.visible){
            bar.setSize(164*this.health/this.maxHealth, 16)
            bar.setX(-82-82*this.health/-this.maxHealth)
        }
    }

    hitEffect(){
        let itr = 0
        const splash = () => {
            if(itr >= 6){
                if(this.damageBar.active){
                    this.damageBar.setSize(164*this.health/this.maxHealth, 16)
                    this.damageBar.setX(-82-82*this.health/-this.maxHealth)
                }
                return
            }

            if(this.sprite.isTinted) this.sprite.clearTint()
            else this.sprite.setTintFill(0xffffff)
            itr++

            setTimeout(() => splash(), 50)
        }
        splash()
        const { x, y } = this.pBody.getPosition()
        this.audio?.hit.playSound(x, y, true, false)
    }

    equipItem(index: number){
        this.magicBook.activeIndex = index
        this.pBody.getWorld().queueUpdate(() => {
            const item = this.magicBook.skills[index]

            if(this.itemInstance){
                const timestamp = item.timestamp
                this.magicBook.setTimestamp(this.magicBook.activeIndex, timestamp)
                this.itemInstance.destroy()
            }

            const newItemInstance = new ItemInstance(this.scene, this.pBody, item.id).itemInstance
            newItemInstance.timestamp = item.timestamp

            if(this.scene.textures.exists('book-'+this.magicBook.id)) this.itemIcon.setTexture('book-'+this.magicBook.id).setVisible(true)
            else this.itemIcon.setVisible(false)

            this.itemInstance = newItemInstance
            this.addAt(this.itemInstance, 0)

            const isReady = this.itemInstance.timestamp+this.itemInstance.config.cooldown < Date.now()
            this.drawAimAssist(isReady)
        })
    }

    drawAimAssist(isReady?: boolean){
        if(this.itemInstance instanceof MeleeWeapon){
            const offsetMultipler = this.itemInstance.config.hitboxOffsetMultipler
            const size = this.itemInstance.config.hitbox;
            this.aimAssist.clear();
            this.aimAssist.fillStyle(isReady ? 0xffffff : 0x880000, isReady ? 0.3 : 0.15);
            if (size.shape === 'box') {
                this.aimAssist.fillRect(
                    (-size.width+offsetMultipler) * this.scene.gameScale * 32,
                    -size.height * this.scene.gameScale * 32,
                    size.width*2 * this.scene.gameScale * 32,
                    size.height*2 * this.scene.gameScale * 32
                );
            } else if (size.shape === 'circle') {
                this.aimAssist.fillCircle(
                    offsetMultipler * this.scene.gameScale * 32,
                    0,
                    size.radius * this.scene.gameScale * 32
                );
            } else if (size.shape === 'polygon') {
                this.aimAssist.beginPath();
                size.vertices.forEach((vertex, index) => {
                    const x = (vertex.x+offsetMultipler) * this.scene.gameScale * 32;
                    const y = vertex.y * this.scene.gameScale * 32;
                    if (index === 0) {
                        this.aimAssist.moveTo(x, y);
                    } else {
                        this.aimAssist.lineTo(x, y);
                    }
                });
                this.aimAssist.closePath();
                this.aimAssist.fillPath();
            }
        }
        else if(this.itemInstance instanceof RangeWeapon){
            const spriteOffsetMultipler = this.itemInstance.config.spriteOffsetMultipler
            const range = this.itemInstance.config.range;
            const hitboxSize = this.itemInstance.config.hitboxSize;
            this.aimAssist.clear();
            this.aimAssist.fillStyle(isReady ? 0xffff88 : 0x880000, isReady ? 0.3 : 0.15);
            this.aimAssist.fillRect(
                spriteOffsetMultipler * this.scene.gameScale * 32,
                -hitboxSize.height * this.scene.gameScale * 32,
                range * this.scene.gameScale * 32,
                hitboxSize.height * 2 * this.scene.gameScale * 32
            );
        }
        else this.aimAssist.clear()
    }

    destroy() {
        this.scene.world.destroyBody(this.pBody)
        if(this.itemInstance) this.itemInstance.destroy()
        super.destroy()
    }
}