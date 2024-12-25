const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', (roomCode) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
        }
        rooms[roomCode].push(socket.id);
        socket.join(roomCode);

        // Notify players
        io.to(roomCode).emit('players-updated', rooms[roomCode]);
    });

    socket.on('move', (data) => {
        io.to(data.room).emit('update-board', data);
    });

    socket.on('disconnect', () => {
        // Remove player from all rooms
        for (let room in rooms) {
            rooms[room] = rooms[room].filter((id) => id !== socket.id);
            if (rooms[room].length === 0) delete rooms[room];
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
