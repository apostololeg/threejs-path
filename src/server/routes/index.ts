// import time from './time';
import auth from './auth';
// import users from './users';
// import posts from './posts';
// import passport from './passport';
// import upload from './uploads';

export default function (app) {
  // passport(app);
  // app.use('/api/time', time);
  app.use('/api/auth', auth);
  // app.use('/api/users', users);
  // app.use('/api/posts', posts);
  // app.use('/api/upload', upload);
}
