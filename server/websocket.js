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
    const data = JSON.parse(message.toString());
    console.log('this is the data coming from the fcn called message', data)
    if (data.bubble_id) {
      console.log('bubble received, sending a message')
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }

        else if (data.type === 'new_user') {
          console.log('user connected', message)
          connectedUsers[ws] = message.userName;
          console.log('connected users are', connectedUsers)
          broadcastUsersList();
        }
        else if (data.type === 'ping') {
          console.log('sending ping')
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