// import time from './time';
import auth from './auth';
import nlp from './nlp';
// import passport from './passport';

export default function (app) {
  // passport(app);
  // app.use('/api/time', time);
  app.use('/api/auth', auth);
  app.use('/api/nlp', nlp);
}
