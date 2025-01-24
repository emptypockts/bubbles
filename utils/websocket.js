let socket =null;
export const initializeWebSocket=(url,onMesaggeCallback)=>{
    socket = new WebSocket(url);

socket.onopen=()=>{
    console.log('websocket is open');
}
socket.onmessage = (event)=>{
    const data =JSON.parse(event.data);
    if (onMessageCallback){
        onMessageCallback(data);
    }
};
socket.onclose=()=>{
    console.log('websocket is closed');
}
socket.onerror=(error)=>{
    console.error('websocket error code is: ',error);
}
}
export const sendMessage =(message)=>{
    if (socket&&socket.readyState===WebSocket.OPEN){
        socket.send(JSON.stringify(message));
    }else{
        console.error('websocket is closed');
    }
};
export const closeWebSocket=()=>{
    if (socket){
        socket.close();
    }
};

