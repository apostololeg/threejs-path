import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import user from '../stores/user';

import Scene from './scene';

class Game {
  scene: Scene;
  socket: Socket;

  constructor() {
    this.scene = new Scene({ onMove: this.onMove });
  }

  start() {
    this.scene._.startVRSession();

    this.socket = io();
    this.socket.on('connect', this.onConnected);
    this.socket.on('user-joined', this.onUserJoined);
    this.socket.on('users-list', this.onUserListUpdate);
    this.socket.on('user-update', this.onUserUpdate);
    this.socket.on('user-left', this.onUserLeft);
    this.socket.on('disconnect', this.onDisconnected);

    this.scene.initObserver(user.data);
  }

  onConnected = () => {
    const { socketId } = user.data;
    console.log('< connected', socketId);
    this.socket.emit('join', { socketId });
  };

  onDisconnected = () => {
    console.log('< disconnected');
  };

  onUserJoined = data => {
    console.log('< user-joined', data.id);
    this.scene.addUser(data);
  };

  onUserLeft = ({ id }) => {
    console.log('< user-left', id);
    this.scene.removeUser(id);
  };

  onUserListUpdate = users => {
    console.log('< users-list', users);
    users.forEach(data => this.scene.addUser(data));
  };

  onUserUpdate = ({ id, data }) => {
    console.log('< user-update', id, data);
    this.scene.updateUser(id, data);
  };

  onMove = position => {
    console.log('> user-update');

    this.socket.emit('user-update', {
      data: { position: position.toArray() },
    });
  };
}

export default new Game();
