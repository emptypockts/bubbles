export default defineNuxtPlugin((nuxtApp) => {
let socket =null;

 const initializeWebSocket=(url,onMessageCallback,userName)=>{
    console.log('this is the ws client. the url passed is: ',url)
     socket = new WebSocket(url);
    socket.onopen =()=>{
    }
    socket.onmessage = (event) =>{
        const data= JSON.parse(event.data);
        if(onMessageCallback){
            console.log('onmsessage function called',data)
            onMessageCallback(data);
        }
    }
    socket.onclose=()=>{
        console.log('websocket is closed');
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
                    console.log("message from ws client script with bubble :",message)
                    socket.send(message);
                } else {
                    console.error('WebSocket is not open');
                }
            },
            close:onclose
        }
    }
};
});
