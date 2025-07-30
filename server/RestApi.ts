import * as express from 'express';
import { Account } from './server';

export class RestApi{

    accounts: Account[]
    authedId: Map<string, string>

    constructor(app: express.Application, accounts: Account[], authedId: Map<string, string>){
        this.accounts = accounts
        this.authedId = authedId

        app.post("/login", (req, res) => this.login(req, res))
    }

    login(req: express.Request, res: express.Response){
        const { id, username } = req.body;

        const user = this.accounts.find(v => v.username === username);

        if(user) this.authedId.set(id, username)
        else {
            this.accounts.push({
                username: username,
                health: 100,
                outfit: {
                    isMale: false,
                    hair: 'basic',
                    face: 'basic',
                    body: 'basic',
                    leg: 'basic'
                },
                magicBook: 'warrior',
                classList: [],
                questCompleted: []
            })
            this.authedId.set(id, username)
        }

        res.json({ message: "success" })
    }
}