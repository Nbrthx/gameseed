import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(this.scale.width/2, this.scale.height/2, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(this.scale.width/2-230, this.scale.height/2, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');

        // Visual Effect
        this.load.spritesheet('punch', 'effect/punch.png', { frameWidth: 64, frameHeight: 64 })
        this.load.spritesheet('throw', 'effect/throw.png', { frameWidth: 64, frameHeight: 64 })
        this.load.spritesheet('sword', 'effect/sword.png', { frameWidth: 96, frameHeight: 96 })
        this.load.spritesheet('sword2', 'effect/sword2.png', { frameWidth: 96, frameHeight: 96 })
        this.load.spritesheet('sword3', 'effect/sword3.png', { frameWidth: 128, frameHeight: 128 })
        this.load.spritesheet('bow', 'effect/bow.png', { frameWidth: 64, frameHeight: 64 })
        this.load.spritesheet('dagger', 'effect/dagger.png', { frameWidth: 96, frameHeight: 64 })
        this.load.spritesheet('fire-burst', 'effect/fire-burst.png', { frameWidth: 128, frameHeight: 128 })
        this.load.spritesheet('fire-burst2', 'effect/fire-burst2.png', { frameWidth: 198, frameHeight: 32 })
        this.load.spritesheet('healing', 'effect/healing.png', { frameWidth: 64, frameHeight: 64 })

        this.load.spritesheet('shot', 'effect/shot.png', { frameWidth: 48, frameHeight: 16 })
        this.load.spritesheet('arrow', 'effect/arrow.png', { frameWidth: 48, frameHeight: 16 })
        this.load.spritesheet('big-arrow', 'effect/big-arrow.png', { frameWidth: 48, frameHeight: 16 })
        this.load.spritesheet('blue-knife', 'effect/blue-knife.png', { frameWidth: 32, frameHeight: 16 })
        this.load.spritesheet('fireball', 'effect/fireball.png', { frameWidth: 32, frameHeight: 16 })
        this.load.spritesheet('puller', 'effect/puller.png', { frameWidth: 32, frameHeight: 16 })

        this.load.spritesheet('explode', 'effect/explode.png', { frameWidth: 64, frameHeight: 64 })
        this.load.image('red-particle', 'effect/red-circle.png')

        // Icon
        this.load.image('icon-punch', 'icon/punch.png')
        this.load.image('icon-sword', 'icon/sword.png')
        this.load.image('icon-sword2', 'icon/sword2.png')
        this.load.image('icon-sword3', 'icon/sword3.png')
        this.load.image('icon-dagger', 'icon/dagger.png')
        this.load.image('icon-fire-burst', 'icon/fire-burst.png')
        this.load.image('icon-fire-burst2', 'icon/fire-burst2.png')
        this.load.image('icon-healing', 'icon/healing.png')
        this.load.image('icon-healing2', 'icon/healing2.png')

        this.load.image('icon-shot', 'icon/shot.png')
        this.load.image('icon-bow', 'icon/bow.png')
        this.load.image('icon-bow2', 'icon/bow2.png')
        this.load.image('icon-blue-knife', 'icon/blue-knife.png')
        this.load.image('icon-fireball', 'icon/fireball.png')
        this.load.image('icon-puller', 'icon/puller.png')

        this.load.image('book-warrior', 'icon/book/warrior.png')
        this.load.image('book-archer', 'icon/book/archer.png')
        this.load.image('book-mage', 'icon/book/mage.png')
        this.load.image('book-ninja', 'icon/book/ninja.png')
        this.load.image('book-healer', 'icon/book/healer.png')
        this.load.image('book-assassin', 'icon/book/assassin.png')

        // Audio

        this.load.audio('audio-step', 'audio/step.wav')
        this.load.audio('audio-hit', 'audio/hit.ogg')

        this.load.audio('audio-punch', 'audio/punch.wav')
        this.load.audio('audio-throw', 'audio/punch.wav')
        this.load.audio('audio-sword', 'audio/sword.mp3')
        this.load.audio('audio-sword2', 'audio/sword.mp3')
        this.load.audio('audio-sword3', 'audio/sword.mp3')
        this.load.audio('audio-bow', 'audio/bow.wav')
        this.load.audio('audio-dagger', 'audio/dagger.wav')
        this.load.audio('audio-healing', 'audio/heal.ogg')
        this.load.audio('audio-fire-burst', 'audio/fire.wav')
        this.load.audio('audio-fire-burst2', 'audio/fire.wav')

        // Environment

        this.load.image('tilemaps', 'environment/tilemaps3.png');
        this.load.spritesheet('tree1', 'environment/tree1.png', { frameWidth: 96, frameHeight: 128 });

        this.load.tilemapTiledJSON('map1', 'environment/map1.json');
        this.load.tilemapTiledJSON('map2', 'environment/map2.json');
        this.load.tilemapTiledJSON('map3', 'environment/map3.json');
        this.load.tilemapTiledJSON('map4', 'environment/map4.json');
        this.load.tilemapTiledJSON('map5', 'environment/map5.json');
        this.load.tilemapTiledJSON('duel', 'environment/duel.json');

        // Character
        this.load.image('shadow', 'char/shadow.png')
        this.load.spritesheet('male', 'char/male.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male1', 'char/male1.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male2', 'char/male2.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male3', 'char/male3.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male4', 'char/male4.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male', 'char/male4.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('female', 'char/female.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('female1', 'char/female1.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('female2', 'char/female2.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('npc1', 'char/npc1.png', { frameWidth: 64, frameHeight: 64 });

        // UI
        this.load.image('ui-skills', 'ui/skills.png')
        this.load.image('ui-selected-skill', 'ui/selected-skill.png')
        this.load.image('ui-change-outfit', 'ui/change-outfit.png')
        this.load.image('ui-fullscreen', 'ui/fullscreen.png')
        this.load.image('ui-debug', 'ui/debug.png')
        this.load.image('ui-chat', 'ui/chat.png')
        this.load.image('ui-book-button', 'ui/book-button.png')
        this.load.image('ui-outfit-button', 'ui/outfit-button.png')
        this.load.image('ask-button', 'ui/ask-button.png')

        this.load.spritesheet('cooldown-anim', 'ui/cooldown-anim.png', { frameWidth: 32, frameHeight: 32 })

        // HTML
        this.load.html('inputname', 'html/inputname.html');
        this.load.html('chatbox', 'html/chatbox.html');

    }

    create () {

        const chars = ['male', 'male1', 'male2', 'male3', 'male4', 'female', 'female1', 'female2', 'npc1']

        // Char
        for(let i=0; i<chars.length; i++){
            this.anims.create({
                key: chars[i]+'-idle',
                frames: this.anims.generateFrameNumbers(chars[i], { frames: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 5, 6] }),
                frameRate: 12,
                repeat: -1
            })
            this.anims.create({
                key: chars[i]+'-rundown',
                frames: this.anims.generateFrameNumbers(chars[i], { frames: [7, 8, 9, 10, 11, 12, 13, 14] }),
                frameRate: 12,
                repeat: -1
            })
            this.anims.create({
                key: chars[i]+'-runup',
                frames: this.anims.generateFrameNumbers(chars[i], { frames: [15, 16, 17, 18, 19, 20, 21, 22] }),
                frameRate: 12,
                repeat: -1
            })
        }

        // Visual Effect
        this.anims.create({
            key: 'punch-attack',
            frames: this.anims.generateFrameNumbers('punch', { frames: [0, 1, 2, 3, 4] }),
            frameRate: 20
        })
        this.anims.create({
            key: 'throw-attack',
            frames: this.anims.generateFrameNumbers('throw', { frames: [0, 0, 0, 0, 0, 1, 2, 3, 4] }),
            frameRate: 20
        })
        this.anims.create({
            key: 'sword-attack',
            frames: this.anims.generateFrameNumbers('sword', { frames: [0, 0, 0, 1, 2, 3, 4, 5, 5] }),
            frameRate: 20
        })
        this.anims.create({
            key: 'sword2-attack',
            frames: this.anims.generateFrameNumbers('sword2', { frames: [0, 0, 0, 1, 2, 3, 4, 5, 5] }),
            frameRate: 20
        })
        this.anims.create({
            key: 'sword3-attack',
            frames: this.anims.generateFrameNumbers('sword3', { frames: [0, 0, 0, 1, 2, 3, 4, 5, 5] }),
            frameRate: 20
        })
        this.anims.create({
            key: 'fire-burst-attack',
            frames: this.anims.generateFrameNumbers('fire-burst', { frames: [0, 0, 0, 1, 2, 3, 4, 5, 5] }),
            frameRate: 20
        })
        this.anims.create({
            key: 'fire-burst2-attack',
            frames: this.anims.generateFrameNumbers('fire-burst2', { frames: [0, 1, 2, 3, 4, 4, 4] }),
            frameRate: 20
        })
        this.anims.create({
            key: 'bow-attack',
            frames: this.anims.generateFrameNumbers('bow', { frames: [0, 1, 2, 3, 4, 4] }),
            frameRate: 20
        })
        this.anims.create({
            key: 'dagger-attack',
            frames: this.anims.generateFrameNumbers('dagger', { frames: [0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8] }),
            frameRate: 20
        })
        this.anims.create({
            key: 'healing-attack',
            frames: this.anims.generateFrameNumbers('healing', { frames: [0, 1, 2, 3, 4, 5, 6] }),
            frameRate: 20
        })

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explode', { frames: [0, 1, 2, 3] }),
            frameRate: 30
        })

        // Object Animation
        this.anims.create({
            key: 'tree1-wave',
            frames: this.anims.generateFrameNumbers('tree1', { frames: [0, 1, 2, 3, 4, 5, 0, 6, 7, 8, 9, 10] }),
            frameRate: 10,
            repeat: -1
        })

        this.scene.start('MainMenu');
    }
}
