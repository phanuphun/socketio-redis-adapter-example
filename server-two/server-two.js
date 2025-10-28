// server-two.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' },
});

const pubClient = createClient({ url: 'redis://localhost:6001' });
const subClient = pubClient.duplicate();
await pubClient.connect();
await subClient.connect();
io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
    console.log('[S2] connected:', socket.id);

    socket.on('join-room', async ({ client, room }) => {
        console.log(`[S2] ${client} joining room: ${room}`);
        await socket.join(room);
        socket.emit('message', `[S2] You have joined room: ${room}`);
    });

    socket.on('message', (msg) => {
        console.log('[S2] message received:', msg);
        io.emit('message', `[S2 relay] ${msg}`);
    });

    socket.on('disconnect', (reason) => {
        console.log('[S2] disconnected:', socket.id, reason);
    });
});

setInterval(() => {
    io.to('server-one-room').emit(
        'server-one-message',
        '[S2] Hello to all clients in Server One Room'
    );
}, 5000);

httpServer.listen(3001, () => {
    console.log('Server Two listening on port 3001');
});
