import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import pick from 'lodash.pick';

import env from '../env';
import routes from './routes';
import { users, USER_PUBLIC_FIELDS } from './state';
import db from './api/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build')));
routes(app);

io.on('connection', socket => {
  console.log('# connected');

  socket.on('join', ({ socketId }) => {
    const user = users[socketId];

    console.log('< join', socketId, user);
    if (!user) return;

    const { id } = user;

    // @ts-ignore
    const usersList = Object.values(users).reduce((arr, data) => {
      if (data.id !== id) arr.push(pick(data, USER_PUBLIC_FIELDS));

      return arr;
    }, [] as any[]);
    io.to(socket.id).emit('users-list', usersList);

    socket.broadcast.emit('user-joined', user);

    socket.on('user-update', ({ data }) => {
      console.log('< user-update', id, data, '\n\t> broadcast...');
      Object.assign(user, data);
      socket.broadcast.emit('user-update', { id, data });
    });

    socket.on('disconnect', async () => {
      const { position } = user;

      console.log('# disconnected', id, position);
      socket.broadcast.emit('user-left', { id });

      await db.user.update({
        where: { id },
        data: { position },
      });

      delete users[socketId];
    });
  });
});

server.listen(env.PORT, () => {
  console.log('listening on port', env.PORT);
});
