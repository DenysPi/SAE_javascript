import { WS_URL } from "./config.js";

export class Multiplayer {

    #ws;

    #game

    #getName
    #getDifficulty
    #getCollection
    #getRoomCode


    #handlers = {}

    constructor(game, getName, getDifficulty, getCollection, getRoomCode) {

        this.#game = game

        this.#getName = getName
        this.#getDifficulty = getDifficulty
        this.#getCollection = getCollection
        this.#getRoomCode = getRoomCode

    }


    async createRoom(){

        const name = this.#getName()

        if (!name) return;

        const roomCode = Math.random().toString(36).substring(2,10).toUpperCase()

        await this.connectAndJoin(name, roomCode)
    }

    async joinRoom(){

        const name = this.#getName()

        const roomCode = this.#getRoomCode().trim().toUpperCase()

        if (!name) return;

        if (!roomCode) return;

        await this.connectAndJoin(name, roomCode);
    }


    async connectAndJoin(name, roomCode){
        
        try{
            await this.connect()
        }catch{

        }

        this.#handlers['WAITING'] = () => {

            console.log("En attente")
        };

        this.#handlers['START'] = ({gameId, difficulty, collection}) => {
            
            this.#game.startGame(gameId, difficulty, collection)

        }

        this.send({
            type: 'JOIN',
            room: roomCode,
            name,
            difficulty: this.#getDifficulty(),
            collection: this.#getCollection()
        })
    }

    connect(){

        return new Promise((resolve, reject) => {

            this.#ws = new WebSocket(WS_URL)
            
            this.#ws.onopen = () => {

                resolve();
            };

            this.#ws.onerror = (err) => {

                reject(err);
            };


            this.#ws.onmessage = (event) => {
                console.log('raw message:', event.data);

                const message = JSON.parse(event.data)

                const handler = this.#handlers[message.type];

                if (handler){
                    handler(message)
                }

            }
            
            
        })
    }

    send(message){
        this.#ws.send(JSON.stringify(message))
    }
}