import pick from 'lodash.pick';
import { config } from 'dotenv';

const { parsed } = config();
const { NODE_ENV } = process.env;
const PRODUCTION = NODE_ENV === 'production';

export default {
  PRODUCTION,
  ...pick(parsed, [
    'PORT',
    'LIVERELOAD',
    'DATABASE_URL',
    'PRISMA_MANAGEMENT_API_SECRET',
    'ADMIN_SECRET',
    'JWT_SECRET',
    'COOKIE_TOKEN_NAME',
    'SESSION_EXPIRED_AFTER',
    'PAGE_LANG',
    'PAGE_TITLE',
  ]),
};
