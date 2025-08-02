import { itemList } from "./ItemInstance"

export const magicBookList: {
    id: string
    name: string
    skills: [string, string, string]
}[] = [
    {
        id: 'warrior',
        name: 'Book of Warrior',
        skills: ['punch', 'sword', 'dagger']
    },
    {
        id: 'archer',
        name: 'Book of Archer',
        skills: ['shot', 'bow', 'bow2']
    },
    {
        id: 'ninja',
        name: 'Book of Ninja',
        skills: ['blue-knife', 'sword', 'puller']
    },
    {
        id: 'mage',
        name: 'Book of Mage',
        skills: ['fireball', 'fire-burst', 'fire-burst2']
    },
    {
        id: 'healer',
        name: 'Book of Healer',
        skills: ['shot', 'sword2', 'healing2']
    },
    {
        id: 'assassin',
        name: 'Book of Assassin',
        skills: ['punch', 'healing', 'sword3']
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
        }
    ]
    activeIndex: number = 0

    constructor(id: string){
        const book = magicBookList.find(v => v.id === id)?.skills || ['punch', 'sword', 'dagger']

        this.id = id
        this.skills = [
            { id: book[0], timestamp: Date.now() },
            { id: book[1], timestamp: Date.now() },
            { id: book[2], timestamp: Date.now() }
        ]
    }
    
    changeBook(id: string){
        const book = magicBookList.find(v => v.id === id)?.skills || ['punch', 'sword', 'dagger']

        this.id = id
        this.skills = [
            { id: book[0], timestamp: Date.now() },
            { id: book[1], timestamp: Date.now() },
            { id: book[2], timestamp: Date.now() }
        ]
    }

    setTimestamp(index: number, timestamp: number){
        if(index < 0 || index > 3) return

        this.skills[index].timestamp = timestamp
    }

    refreshTimestamp(isUse: boolean = true){
        for(let i = 0; i < 3; i++){
            const skill = this.skills[i]
            if(!skill) continue

            const instanceData = itemList.find(v => v.id === skill.id) || itemList[0]
            const cooldown = instanceData.config.cooldown

            if(i == this.activeIndex && isUse) skill.timestamp = Date.now()
            else if(Date.now()-skill.timestamp > cooldown) skill.timestamp = Date.now()-cooldown+500
        }
    }
}