export default defineNuxtPlugin((nuxtApp) => {
let socket =null;
let pingInterval=null;
const bubbleSound = new Audio('/bubble.mp3');
 const initializeWebSocket=(url,onMessageCallback)=>{
    console.log('this is the ws client. the url passed is: ',url)
    if (socket){
        console.log('closing old socket connection')
        clearInterval(pingInterval);
        socket.close();
    }
     socket = new WebSocket(url);

    socket.onopen =()=>{
        console.log('connected to socket server')

    
    }
    pingInterval=setInterval(() => {
        console.log('ready state?',socket.readyState)
        console.log('websocket open?',WebSocket.OPEN)
        if (socket.readyState === WebSocket.OPEN) {
            console.log('sending ping...')
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    socket.onmessage = (event) =>{
        const data= JSON.parse(event.data);
        if(onMessageCallback){
            console.log('onmsessage function called',onMessageCallback)
            bubbleSound.play().catch(error => console.error("Error playing sound:", error));
            onMessageCallback(data);
        }
    }
    socket.onclose=(event)=>{
        console.log('websocket is closed',event);
        clearInterval(pingInterval)
    }
    socket.onerror=(error)=>{
        console.error('websocket error: ',error);
    };
};
return {
    provide: {
        websocket: {
            connect: initializeWebSocket,
            send: (message) => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    console.log("socket && socket.readyState === WebSocket.OPEN:",socket)
                    socket.send(message);
                } else {
                    initializeWebSocket
                    console.error('WebSocket is not open');
                }
            },
            close:()=>{
                console.log('closing websocket')
                clearInterval(pingInterval)
                socket.close();
            }
        }
    }
};
});
