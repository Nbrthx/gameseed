import { Scene, GameObjects } from 'phaser';
import { io, Socket } from 'socket.io-client';

const HOSTNAME = 'http://localhost:3000'

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
        this.cameras.main.setBackgroundColor(0x000000);

        const bg = this.add.image(this.scale.width/2, this.scale.height/2, 'capsule-art');
        bg.setScale(this.scale.width/1920*6)
        bg.setAlpha(0.7)
        
        // this.logo = this.add.image(this.scale.width/2, this.scale.height/2-100, 'logo');

        const titleBg = this.add.rectangle(this.scale.width-200, 180, 560, 360, 0x000000, 0.6)
        titleBg.setOrigin(0.5)

        const title = this.add.text(this.scale.width-200, 160, 'Magic\nBook\nSeekers', {
            fontFamily: 'PixelFont', fontSize: 80, color: '#ffffff'
        })
        title.setOrigin(0.5)

        const inputname = this.add.dom(this.scale.width/2, this.scale.height/2).createFromCache('inputname')
        const submitBtn = inputname.getChildByID('submit') as HTMLButtonElement

        let isLoading = false

        submitBtn.addEventListener('click', () => {
            const username = inputname.getChildByID('username') as HTMLInputElement
            if(isLoading) return
            isLoading = true
            
            if(!username.value) return

            if(!this.registry.get('socket')){
                const socket = io(HOSTNAME, { transports: ['websocket'] });
                socket.on('connect', () => {
                    xhrApi('POST', HOSTNAME+'/login', { id: socket.id, username: username.value }, (_data: any) => {
                        inputname.setVisible(false)
                        this.registry.set('socket', socket)
                        this.registry.set('username', username.value)
                        start()
                        isLoading = false
                    })
                })
            }
            else{
                const socket = this.registry.get('socket') as Socket
                xhrApi('POST', HOSTNAME+'/login', { id: socket.id, username: username.value }, (_data: any) => {
                    inputname.setVisible(false)
                    this.registry.set('username', username.value)
                    start()
                    isLoading = false
                })
            }
        })

        const start = () => {

            this.scale.startFullscreen();
            this.scene.start('Game');
            
        }
    }
}
