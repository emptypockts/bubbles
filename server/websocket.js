import WebSocket, { WebSocketServer } from 'ws';
console.log('This script is executed from the pkacge.json file that I added by default')

const wss = new WebSocketServer({ port: 3003 });

wss.on('connection',(ws)=>{
    console.log('client connected')

ws.on('close',()=>{
    console.log('a client disconnected');
});

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    console.log(data)
    if (message.bubble_id!=='') {
      console.log('message received, sending a message?')
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });
});