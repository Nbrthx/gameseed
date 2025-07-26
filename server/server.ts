import { createServer } from 'http'
import * as express from "express"
import * as cors from 'cors'
import * as bodyParser from 'body-parser'

import { SocketManager } from './SocketManager'
import { RestApi } from './RestApi'

export interface Item {
    id: string
    timestamp: number
    quantity: number
}

export interface Account{
    username: string
    health: number
    outfit: {
        isMale: boolean
        hair: string
        face: string
        body: string
        leg: string
    }
    classList: string[]
    questCompleted: string[]
    questInProgress?: [string, number[]]
}

const app = express()
const httpServer = createServer(app)
var htmlPath = __dirname+'/../dist';

app.use(express.static(htmlPath));
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (_req, res) => res.sendFile(htmlPath+'/index.html'))

const accounts: Account[] = []

const authedId: Map<string, string> = new Map() // socket.id | username

new RestApi(app, accounts, authedId)

new SocketManager(httpServer, accounts, authedId)

httpServer.listen(3000, () => {
    console.log('listening on *:3000')
})