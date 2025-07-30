import { Scene, GameObjects } from 'phaser';
import { io, Socket } from 'socket.io-client';

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

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;

    constructor () {
        super('MainMenu');
    }

    create () {
        this.logo = this.add.image(this.scale.width/2, this.scale.height/2-100, 'logo');

        const inputname = this.add.dom(this.scale.width/2, this.scale.height/2).createFromCache('inputname')
        const submitBtn = inputname.getChildByID('submit') as HTMLButtonElement
        submitBtn.addEventListener('click', () => {
            const username = inputname.getChildByID('username') as HTMLInputElement
            
            if(!username.value) return

            if(!this.registry.get('socket')){
                const socket = io('http://localhost:3000', { transports: ['websocket'] });
                socket.on('connect', () => {
                    xhrApi('POST', 'http://localhost:3000/login', { id: socket.id, username: username.value }, (_data: any) => {
                        inputname.setVisible(false)
                        this.registry.set('socket', socket)
                        this.registry.set('username', username.value)
                        start()
                    })
                })
            }
            else{
                const socket = this.registry.get('socket') as Socket
                xhrApi('POST', 'http://localhost:3000/login', { id: socket.id, username: username.value }, (_data: any) => {
                    inputname.setVisible(false)
                    this.registry.set('username', username.value)
                    start()
                })
            }
        })

        const start = () => {

            this.scale.startFullscreen();
            this.scene.start('Game');
            
        }
    }
}
