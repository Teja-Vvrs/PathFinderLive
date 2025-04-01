const express=require('express');
const app=express();
const http=require('http');
const socketio=require('socket.io');
const server=http.createServer(app);
const io=socketio(server);

app.get('/',(req,res)=>{
    res.send('Hello World!');
});

server.listen(3000,()=>{   
    console.log('Server is running on port 3000');
});