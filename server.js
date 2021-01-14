const path= require('path')
const express = require('express');
const http = require('http')
const app = express();
const socketio= require('socket.io');
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser,removeUser,getRoomUsers} = require('./utils/users')


const server = https.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket =>{

    socket.on('joinRoom',({username , room})=>{
        
        const user =userJoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit('message',formatMessage('Bot : ','Welcome to chat'));

            //when a user connects-- broadcast to all client except the one joining
        socket.broadcast.to(user.room).emit('message',formatMessage('Bot',`${user.username} has joined the chat`));
        //it is to broadcast everyone
        //io.emit();

        io.to(user.room).emit('roomUsers',{

            room: user.room,
            users: getRoomUsers(user.room)

        });

    });


    //when client disconnects-- broadcast
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id);
        
        if(user){
            io.to(user.room).
            emit('message',formatMessage('Bot : ' ,` ${user.username} has left the chat`));
            
            io.to(user.room).emit('roomUsers',{

                room: user.room,
                users: getRoomUsers(user.room)
    
            });
        
        }

        
       
        
    });

    //listen for messages 
    socket.on('chatMessage',(msg) =>{
   // console.log(msg);
        const user= getCurrentUser(socket.id);
    io.to(user.room).emit('message',formatMessage(`${user.username} : `,msg));
    });





});



const PORT = process.env.PORT || 3000;
server.listen(PORT,()=> console.log('server listening on port',PORT));
