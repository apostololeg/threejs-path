const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'client/public')));

const users = {};

io.on('connection', socket => {
  const { id } = socket;
  console.log('< user-joined', id);

  const usersList = Object.entries(users).map(([id, { data }]) => ({
    id,
    data,
  }));
  console.log('> users-list', usersList);
  io.to(id).emit('users-list', usersList);

  users[id] = { socket, data: {} };

  socket.broadcast.emit('user-joined', { id });

  socket.on('user-update', ({ id, data }) => {
    console.log('< user-update', id, data, '\n> broadcast...');
    Object.assign(users[id].data, data);
    socket.broadcast.emit('user-update', { id, data });
  });

  socket.on('disconnect', () => {
    console.log('< user disconnected');
    delete users[id];
    socket.broadcast.emit('user-left', { id });
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
