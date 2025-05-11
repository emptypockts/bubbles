import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

const server = http.createServer();
const wss = new WebSocketServer({ port: 3003 });
console.log('This script is executed from the pkacge.json file that I added by default')
wss.on('connection', (ws) => {
  console.log('a client connected')
  ws.on('disconnect', (event) => {
    console.log('socket disconnected due to :', event)
  })
  ws.on('close', (event) => {
    console.log('a client disconnected', event);
  });

  ws.on('message', (message) => {
    const object = JSON.parse(message.toString());

    switch (object.type) {
        case 'bubble':
            console.log('object type is a bubble');
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(object));
                }
            });
            break;

        case 'new_user':
            console.log('user connected', message);
            connectedUsers[ws] = message.userName;
            console.log('connected users are', connectedUsers);
            broadcastUsersList();
            break;

        case 'ping':
            console.log('sending ping');
            break;

        case 'invitation':
            console.log('this is an invitation');
            try {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(object.data));
                    }
                });
            } catch (err) {
                console.error(err);
            }
            break;

        default:
            console.error('Unknown message type:', object.type);
            break;
    }
});

  function broadcastUsersList() {
    const users = Object.values(connectedUsers);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'user_list',
          users
        }))
      }
      console.log(users)
    });

  }
});



// server.listen(3003, () => {
//   console.log('WebSocket server running on ws://localhost:3003');
// });