const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

let players = [];

server.on('connection', (socket) => {
    console.log('New player connected');
    let playerId = Date.now();  // Use current timestamp as player ID
    let playerColor = null;

    socket.on('message', (data) => {
        const message = JSON.parse(data);

        if (message.type === 'join') {
            playerColor = message.color;
            players.push({ id: playerId, color: playerColor, x: 0, y: 0 });
        } else if (message.type === 'move') {
            const player = players.find(p => p.id === message.id);
            if (player) {
                player.x = message.x;
                player.y = message.y;
            }
        }

        // Broadcast the updated player positions to all clients
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'update', players }));
            }
        });
    });

    socket.on('close', () => {
        players = players.filter(player => player.id !== playerId);
    });
});

console.log('Server running on ws://localhost:3000');
