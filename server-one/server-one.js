import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});
app.use(cors());

const pubClient = createClient({ url: 'redis://localhost:6001' });
const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();

io.adapter(createAdapter(pubClient, subClient));

io.on('connection', async (socket) => {
    console.log('a user connected:', socket.id);
    socket.on('join-room', (data) => {
        const { client, room } = data;
        console.log(`${client} joining room: ${room}`);
        socket.join(room);
        socket.emit('message', `You have joined room: ${room}`);
    });
   
    socket.on('message', (msg) => {
        console.log('message received on server one:', msg);
        io.emit('message', msg);
    });
    
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });

    
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        io.to('server-one-room').emit('server-one-message',
            'Hello to all clients in Server One Room')
    }
});

// io.to('server-one-room').emit('server-one-message', 
//     'Hello to all clients in Server One Room')

httpServer.listen(3000, () => {
    console.log('Server One listening on port 3000');
});
