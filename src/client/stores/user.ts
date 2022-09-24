import { createStore } from 'justorm/react';

import api from '../tools/request';

const STORE = createStore('user', {
  data: null,
  isLoading: true,

  async init() {
    this.tryRequest(api.get('/api/auth/me'));
  },

  async login(data) {
    this.tryRequest(api.post('/api/auth/login', { data }));
  },

  async register(data) {
    this.tryRequest(api.post('/api/auth/register', { data }));
  },

  async tryRequest(request) {
    this.isLoading = true;
    try {
      this.data = await request;
    } catch (e) {
    } finally {
      this.isLoading = false;
    }
  },
});

STORE.init();

export default STORE;
