interface Task {
    type: 'kill'
    target: string
    amount: number
}

export interface QuestConfig{
    id: string
    npcId: string
    name: string
    description: string
    taskInstruction: string // make it short
    task: Task[]
    reward: { book?: string }
    repeatable?: true
}

// npcId | quest
const quests: QuestConfig[] = [
    {
        id: 'quest1',
        npcId: 'npc1',
        name: 'Defeat the Swordman',
        description: 'The Swordman is in the forest. Defeat him and get a reward.',
        taskInstruction: 'Defeat the Swordman',
        task: [{ type: 'kill', target: 'enemy1', amount: 3 }],
        reward: { book: 'healer' }
    },
    {
        id: 'quest2',
        npcId: 'npc1',
        name: 'Defeat the Archer',
        description: 'The Archer is in the forest. Defeat him and get a reward.',
        taskInstruction: 'Defeat the Archer',
        task: [{ type: 'kill', target: 'enemy2', amount: 4  }],
        reward: { book: 'mage' }
    },
    {
        id: 'quest3',
        npcId: 'npc1',
        name: 'Defeat the Ninja',
        description: 'The Ninja is in the east forest. Defeat him and get a reward.',
        taskInstruction: 'Defeat the Ninja',
        task: [{ type: 'kill', target: 'enemy3', amount: 5  }],
        reward: { book: 'ninja' }
    },
    {
        id: 'quest4',
        npcId: 'npc1',
        name: 'Defeat the Assassin',
        description: 'The Assassin is in the north forest. Defeat him and get a reward.',
        taskInstruction: 'Defeat the Assassin',
        task: [{ type: 'kill', target: 'enemy4', amount: 6  }],
        reward: { book: 'assassin' }
    }
]

export class Quest {

    config: QuestConfig;
    taskProgress: number[]; // for tracking progress in the task
    isComplete: boolean = false;
    private progressCallback: (taskProgress: number[], isComplete: boolean) => void = () => {}; // Default empty function

    constructor(config: QuestConfig) {
        this.config = config;
        this.taskProgress = new Array(config.task.length).fill(0);
    }

    setTaskProgress(progress: number[]) {
        if (progress.length !== this.config.task.length) return;
        this.taskProgress = progress;
        this.progressCheck();
        this.progressCallback(this.taskProgress, this.isComplete);
    }

    addProgress(taskType: string, target: string, quantity: number = 1){
        this.config.task.forEach((task, i) => {
            if(task.type == taskType && task.target == target){
                this.taskProgress[i] += quantity;
                if(this.taskProgress[i] > this.config.task[i].amount) {
                    this.taskProgress[i] = this.config.task[i].amount;
                }

                this.progressCheck();
                this.progressCallback(this.taskProgress, this.isComplete);
            }
        })
    }

    private progressCheck() {
        let isComplete = true;
        for (let i = 0; i < this.config.task.length; i++) {
            if (this.taskProgress[i] < this.config.task[i].amount) {
                isComplete = false;
                break;
            }
        }
        this.isComplete = isComplete;
    }

    onProgress(callback: (taskProgress: number[], isComplete: boolean) => void) {
        this.progressCallback = callback;
    }

    destroy(){
        this.progressCallback = () => {}
    }
}


export class Quests {
    static isNpcQuestRepeatable(npcId: string): boolean {
        return !!quests.filter(q => q.npcId == npcId).some(q => q.repeatable);
    }
    static getQuestsByNpcId(npcId: string): Quest[]{
        const quest = quests.filter(q => q.npcId == npcId).map(q => new Quest(q))
        return quest
    }

    static getQuestByNpcId(npcId: string, completedQuest: string[]): Quest | null {
        const quests = this.getQuestsByNpcId(npcId);
        if(!quests || quests.length === 0) return null;

        // Cari quest yang belum selesai atau quest repeatable yang sudah diselesaikan
        for(const quest of quests) {
            const isCompleted = completedQuest.includes(quest.config.id);
            // Berikan quest jika belum selesai atau quest repeatable
            if(!isCompleted) {
                return quest;
            }
        }

        return null; // Semua quest telah diselesaikan
    }

    static getQuestByQuestId(questId: string): Quest | null {
        const quest = quests.find(q => q.id === questId);
        if (quest != undefined) {
            return new Quest(quest);
        }
        return null;
    }
}