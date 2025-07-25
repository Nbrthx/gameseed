import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.logo = this.add.image(this.scale.width/2, this.scale.height/2, 'logo');

        this.title = this.add.text(this.scale.width/2, this.scale.height/2+100, 'Main Menu', {
            fontFamily: 'PixelFont', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
