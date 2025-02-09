import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

const server = http.createServer();
const wss = new WebSocketServer({ port: 3003 });
console.log('This script is executed from the pkacge.json file that I added by default')
wss.on('connection', (ws) => {
  console.log('a client connected')

  ws.on('close', () => {
    console.log('a client disconnected');
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    console.log('this is the data coming from the fcn called message',data)
    if (message.bubble_id !== '') {
      console.log('message received, sending a message?')
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
        else if(data.type==='new_user'){
          connectedUsers[ws]=data.userName;
          broadcastUsersList();
        }
      });
    }
  });
  function broadcastUsersList(){
    const users = Object.values(connectedUsers);
    wss.clients.forEach((client)=>{
      if (client.readyState===WebSocket.OPEN){
        client.send(JSON.stringify({
          type:'user_list',
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