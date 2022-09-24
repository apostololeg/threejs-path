import { Router } from 'express';
import { nanoid } from 'nanoid';
import pick from 'lodash.pick';

import { getToken, setCookie, clearCookie } from '../api/auth';
import { createUser, getCurrentUser } from '../api/users';
import db from '../api/db';
import { users, socketIds, USER_PUBLIC_FIELDS } from '../state';

const router = Router();

function authorize(res, user) {
  setCookie(res, getToken(user.id));
  res.status(200).json(userResponse(user, userToSocketId(user)));
}

function userResponse(user, socketId) {
  return { ...pick(user, USER_PUBLIC_FIELDS), socketId };
}

function userToSocketId(user) {
  const socketId = socketIds[user.id] ?? nanoid();
  users[socketId] = user as any;
  return socketId;
}

router
  .get('/me', async (req, res) => {
    const user = (await getCurrentUser(req, {
      id: true,
      position: true,
    })) as any;

    if (!user) return res.status(401).end();

    res.json(userResponse(user, userToSocketId(user)));
  })
  .post('/register', async (req, res) => {
    const { user, error } = await createUser(req.body);

    if (error) {
      res.status(409).json(error);
      return;
    }

    authorize(res, user);
  })
  .post('/login', async (req, res) => {
    const { id, password } = req.body;
    const user = await db.user.findFirst({
      where: {
        AND: [{ id }, { password }],
      },
    });

    if (!user) res.status(403).json(null);

    authorize(res, user);
  })
  // .get('/loginas/:id', async (req, res) => {
  //   const id = parseInt(req.params.id, 10);
  //   const data = await db.user.findUnique({ where: { id } });

  //   setCookie(res, getToken(id));
  //   res.json(data);
  // })
  .get('/logout', (req, res) => {
    clearCookie(res);
    res.redirect('/');
  });

export default router;
