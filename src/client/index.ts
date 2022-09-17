import { io } from 'socket.io-client';

import Scene from './scene';

const socket = io();
const scene = new Scene({ socket });

// @ts-ignore
window.scene = scene;

socket.on('connect', () => {
  const { id } = socket;
  const me = scene._.observer.object.children[1];
  const { color } = me.material;

  console.log('< connect', id);

  const data = {
    color: [color.r, color.g, color.b],
    position: [...me.position],
  };

  console.log('> user-update', id, data);
  socket.emit('user-update', { id, data });
});

socket.on('user-joined', ({ id }) => {
  console.log('< user-joined', id);
  scene.addUser(id);
});

socket.on('any', data => {
  console.log('any', data);
});
socket.on('users-list', usersList => {
  console.log('< users-list', usersList);
  usersList.forEach(({ id, data }) => scene.addUser(id, data));
});

socket.on('user-update', ({ id, data }) => {
  console.log('< user-update', id, data);
  scene.updateUser(id, data);
});

socket.on('user-left', ({ id }) => {
  console.log('< user-left', id);
  scene.removeUser(id);
});

socket.on('disconnect', () => {
  console.log('< disconnect');
});
