import jwt from 'jsonwebtoken';

import env from '../../env';
import db from './db';

export function parseUserId(req) {
  const authToken = req.cookies[env.COOKIE_TOKEN_NAME];

  if (!authToken) return null;

  try {
    const { id } = jwt.verify(authToken, env.JWT_SECRET);
    return String(id);
  } catch (e) {
    return null;
  }
}

export function getCurrentUser(req, select) {
  const id = parseUserId(req);

  if (!id) return Promise.resolve(null);
  return db.user.findUnique({ where: { id }, select });
}

export async function createUser(profile) {
  const { id, password } = profile;

  try {
    const data = {
      id,
      password,
      position: [0, 0, 0],
    };
    const user = await db.user.create({ data });
    return { user };
  } catch (error) {
    console.log('> error', error);
    return { error: { ...error, message: 'Failed to create user' } };
  }
}
