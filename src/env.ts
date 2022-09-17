import { config } from 'dotenv';

const { parsed } = config();
const { NODE_ENV } = process.env;
const PRODUCTION = NODE_ENV === 'production';

export default {
  PRODUCTION,
  ...parsed,
} as any;
