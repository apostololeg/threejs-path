import jwt from 'jsonwebtoken';

import env from '../../env';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.PRODUCTION,
};

export const getToken = id =>
  jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.SESSION_EXPIRED_AFTER });

export const setCookie = (res, token) => {
  res.cookie(env.COOKIE_TOKEN_NAME, token, COOKIE_OPTS);
};

export const clearCookie = res => {
  res.clearCookie(env.COOKIE_TOKEN_NAME, COOKIE_OPTS);
};
