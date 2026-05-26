import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = 3000;
const MEMORY_URL = 'https://memory.iuthub.fr/api/game';

const server = createServer();
const wss = new WebSocketServer({ server });



const rooms  = new Map();



wss.on('connection', (socket) => {
    console.log("Client connecté");
    socket.on('message', async (message_in) => {

        let message;

        try {
            message = JSON.parse(message_in);

        }
        catch (error) {
    
            return;
        }

        switch (message.type) {

            case "JOIN": {
                if (!rooms.has(message.room)){

                    rooms.set(message.room, {players: [], gameId: null, scores: {} })
                }

            

                const room = rooms.get(message.room);

                if (room.players.length >= 2) {
                return;
                }

                socket.room = message.room
                socket.name = message.name
                room.players.push(socket)
                room.scores[message.name] = 0

                if (room.players.length === 1) {
                    socket.send(JSON.stringify({type: "WAITING", room: message.room}));
                }else{

                    try {
                        const response = await fetch(`${MEMORY_URL}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                            name: `${room.players[0].name} vs. ${room.players[1].name}`,
                            difficulty: message.difficulty
                            })
                        });
                        const data = await response.json()

                        const difficulty = parseInt(message.difficulty, 10);
                        const duration = getDuration(difficulty);

                        room.gameId = data.id
                        room.totalPairs = difficulty;
                        room.matchedPairs = 0;
                        room.timeLeft = duration;
                        room.ended = false;
                        
                        const cardOrder = generateCartesOrdre(parseInt(message.difficulty))
                        broadcast(message.room, {
                            type: 'START',
                            gameId: data.id,
                            difficulty: message.difficulty,
                            collection: message.collection,
                            firstPlayer: room.players[0].name,
                            cardOrder,
                            duration,
                            players: room.players.map(p => p.name)
                        })

                        room.interval = setInterval(() => {
                            if (room.ended) return;

                            room.timeLeft--;
                            
                            broadcast(message.room, {
                                type: 'TICK',
                                timeLeft: room.timeLeft
                            });

                            if (room.timeLeft <= 0) {
                                finirPartie(message.room, "TIMEOUT");
                                
                            }
                        }, 1000);

                    }catch (error) {
                        console.error('Error:', error);
                        room.players.forEach(player => player.send(JSON.stringify({type: "ERROR", message: 'Erreur lors de la création de la partie'})));
                        return;
                    }
                }
                break;
            }
            case "CARD_FLIP":{

                broadcast(socket.room, {
                    type: "CARD_FLIP",
                    cardIndex: message.cardIndex,
                    player:socket.name
                }, socket)
                break
            }
            case "FLIP_BACK":{

                broadcast(socket.room, {type:"FLIP_BACK"}, socket)
                break
            }
            case "LEAVE":{

                const room = rooms.get(message.room)

                if (room){

                    rooms.delete(message.room)
                }

                break
            }
        }
    });


    socket.on('close', () => {
        if (!socket.room) return;
        const room = rooms.get(socket.room);
        if (!room || room.ended) return;
        finirPartie(socket.room, "DISCONNECT");
    });

});


async function finirPartie(roomId, raison) {
  const room = rooms.get(roomId);
  if (!room || room.ended) return;
  room.ended = true;
 
  if (room.tickInterval) {
    clearInterval(room.tickInterval);
  }
 
  const pairsRemaining = room.totalPairs - room.matchedPairs;
 
  try {
    await fetch(`${MEMORY_URL}/${room.gameId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: pairsRemaining })
    });
  } catch (err) {
    //
  }
 
  broadcast(roomId, {
    type: 'GAME_END',
    raison: raison,
    pairsRemaining,
    scores: room.scores
  });
 
  rooms.delete(roomId);
}


function generateCartesOrdre(diffuculty){
  const ids = []
  for(let i=1; i<=diffuculty;i++){
    ids.push(i)
  }
  const cards = [...ids, ...ids]
  cards.sort(()=> Math.random()-0.5)
  return cards

}

function broadcast(roomId, message, exclude=null){

  const room = rooms.get(roomId)

  if (!room) return;

  const msg = JSON.stringify(message)

  for(const player of room.players){
    if(player===exclude) continue;
    player.send(msg)
  }
}

function getDuration(difficulty) {
  switch (difficulty) {
    case 4: return 20;
    case 6: return 30;
    case 8: return 60;
    default: return 30;
  }
}



server.listen(PORT, () => console.log(`Serveur WebSocket sur ws://localhost:${PORT}`));
