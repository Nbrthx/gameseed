import { itemList } from "./ItemInstance"

const magicBookList: {
    id: string
    name: string
    skills: [string, string, string]
}[] = [
    {
        id: 'warrior',
        name: 'Book of Warrior',
        skills: ['sword', 'bow', 'dagger']
    },
    {
        id: 'archer',
        name: 'Book of Archer',
        skills: ['bow', 'sword', 'blue-knife']
    }
]

export class MagicBook{

    id: string
    skills: [
        {
            id: string,
            timestamp: number
        },
        {
            id: string,
            timestamp: number
        },
        {
            id: string,
            timestamp: number
        },
        {
            id: string,
            timestamp: number
        }
    ]
    activeIndex: number = 0

    constructor(id: string){
        const book = magicBookList.find(v => v.id === id)?.skills || ['sword', 'bow', 'dagger']

        this.id = id
        this.skills = [
            { id: 'punch', timestamp: Date.now() },
            { id: book[0], timestamp: Date.now() },
            { id: book[1], timestamp: Date.now() },
            { id: book[2], timestamp: Date.now() }
        ]
    }
    
    changeBook(id: string){
        const book = magicBookList.find(v => v.id === id)?.skills || ['sword', 'bow', 'dagger']

        this.id = id
        this.skills = [
            { id: 'punch', timestamp: Date.now() },
            { id: book[0], timestamp: Date.now() },
            { id: book[1], timestamp: Date.now() },
            { id: book[2], timestamp: Date.now() }
        ]
    }

    setTimestamp(index: number, timestamp: number){
        if(index < 0 || index > 4) return

        this.skills[index].timestamp = timestamp
    }

    refreshTimestamp(isUse: boolean = true){
        for(let i = 0; i < 5; i++){
            const skill = this.skills[i]
            if(!skill) continue

            const instanceData = itemList.find(v => v.id === skill.id) || itemList[0]
            const cooldown = instanceData.config.cooldown

            if(i == this.activeIndex && isUse) skill.timestamp = Date.now()
            else if(Date.now()-skill.timestamp > cooldown) skill.timestamp = Date.now()-cooldown+500
        }
    }
}