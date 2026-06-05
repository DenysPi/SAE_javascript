import { WS_URL } from "./config.js";

export class Multiplayer {

    #ws;

    #game

    #getName
    #getDifficulty
    #getCollection
    #roomCode

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
        this.#roomCode = roomCode;
        try{
            await this.connect()
        }catch{

        }

        this.#handlers['WAITING'] = () => {
            this.#game.onWaiting(this.#roomCode);
        };

        this.#handlers['START'] = ({gameId, difficulty, collection, cardOrder, multiplayer, firstPlayer}) => {
            const monTour = firstPlayer === this.#getName()
            this.#game.startGame(gameId, difficulty, collection, cardOrder, this, monTour)

            
            this.#handlers["CARD_FLIP"] = ({cardIndex}) =>{
                this.#game.flipDistinct(cardIndex);
            }
            this.#handlers["FLIP_BACK"]= () =>{

                this.#game.flipBackDistant();
            }
            this.#handlers["TICK"] = ({timeLeft}) => {
                this.#game.onTick(timeLeft);
            }
            this.#handlers["GAME_END"] = (message) => {
                this.#game.onGameEnd(message);
            }
            this.#handlers["SCORE_UPDATE"] = ({ scores }) => {
                this.#game.onScoreUpdate(scores);
            };

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

    sendCardFlip(cardIndex){
        
        this.send({type:"CARD_FLIP", cardIndex})
    }
    sendMatch(){
        this.send({type:"MATCH"})
    }

    sendFlipBack(){
        this.send({type:"FLIP_BACK"})
    }

    send(message){
        this.#ws.send(JSON.stringify(message))
    }

    get roomCode() {
        return this.#roomCode;
    }
}