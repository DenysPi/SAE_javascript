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

                        room.gameId = data.id

                        broadcast(message.room, {
                            type: 'START',
                            gameId: data.id,
                            difficulty: message.difficulty,
                            collection: message.collection,
                            firstPlayer: room.players[0].name,
                            players: room.players.map(p => p.name)
                        })

                    }catch (error) {
                        console.error('Error:', error);
                        room.players.forEach(player => player.send(JSON.stringify({type: "ERROR", message: 'Erreur lors de la création de la partie'})));
                        return;
                    }
                }
            }

    }});
});



function broadcast(roomId, message, exclude=null){

  const room = rooms.get(roomId)

  if (!room) return;

  const msg = JSON.stringify(message)

  for(const player of room.players){
    if(player===exclude) continue;
    player.send(msg)
  }
}


server.listen(PORT, () => console.log(`Serveur WebSocket sur ws://localhost:${PORT}`));
