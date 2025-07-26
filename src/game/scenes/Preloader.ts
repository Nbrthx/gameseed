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

        // Environment

        this.load.image('tilemaps', 'environment/tilemaps3.png');
        this.load.spritesheet('tree1', 'environment/tree1.png', { frameWidth: 96, frameHeight: 128 });

        this.load.tilemapTiledJSON('map1', 'environment/map1.json');

        // Character
        this.load.image('shadow', 'char/shadow.png')
        this.load.spritesheet('male', 'char/male.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('male', 'char/male.png', { frameWidth: 64, frameHeight: 64 });

    }

    create ()
    {

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('male', { frames: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 5, 6] }),
            frameRate: 12,
            repeat: -1
        })
        this.anims.create({
            key: 'rundown',
            frames: this.anims.generateFrameNumbers('male', { frames: [7, 8, 9, 10, 11, 12, 13, 14] }),
            frameRate: 14,
            repeat: -1
        })
        this.anims.create({
            key: 'runup',
            frames: this.anims.generateFrameNumbers('male', { frames: [15, 16, 17, 18, 19, 20, 21, 22] }),
            frameRate: 14,
            repeat: -1
        })

        this.anims.create({
            key: 'tree1-wave',
            frames: this.anims.generateFrameNumbers('tree1', { frames: [0, 1, 2, 3, 4, 5, 0, 6, 7, 8, 9, 10] }),
            frameRate: 10,
            repeat: -1
        })

        this.scene.start('MainMenu');
    }
}
