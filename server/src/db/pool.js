const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const isNeon = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...((isProduction || isNeon) && {
    ssl: { rejectUnauthorized: true },
  }),
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(-1);
});

module.exports = pool;
