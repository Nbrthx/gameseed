import { Scene, GameObjects } from 'phaser';
import { io } from 'socket.io-client';

function xhrApi(method: string, url: string, json: {}, callback: (data: any) => void){
    const xhr = new XMLHttpRequest();
    if(method == 'POST'){
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => {
            if(xhr.status != 200) return
            const data = JSON.parse(xhr.responseText);
            callback(data)
        };
        const data = JSON.stringify(json);
        xhr.send(data);
    }
    else{
        xhr.open('GET', url, true);
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            callback(data);
        };
        xhr.send();
    }
}

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
        this.logo = this.add.image(this.scale.width/2, this.scale.height/2-100, 'logo');

        this.title = this.add.text(this.scale.width/2, this.scale.height/2, 'Play', {
            fontFamily: 'PixelFont', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const inputname = this.add.dom(this.scale.width/2, this.scale.height/2+100).createFromCache('inputname')
        const submitBtn = inputname.getChildByID('submit') as HTMLButtonElement
        submitBtn.addEventListener('click', () => {
            const username = inputname.getChildByID('username') as HTMLInputElement
            
            if(!username.value) return

            const socket = io('http://localhost:3000', { transports: ['websocket'] });
            socket.on('connect', () => {
                xhrApi('POST', 'http://localhost:3000/login', { id: socket.id, username: username.value }, (_data: any) => {
                    inputname.setVisible(false)
                    this.registry.set('socket', socket)
                    this.registry.set('username', username.value)
                    this.title.setInteractive();
                })
            })
        })

        this.title.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
