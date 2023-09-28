const { Pool} = require('pg');


const pool = new Pool({
  user: 'cdgvxvol',
  host: 'abul.db.elephantsql.com',
  database: 'cdgvxvol',
  password: 'O5Z0UXgVHLwlvj_3IcAnTzAnB8m19dEe',
  port: 5432,
  max:10,
  idleTimeoutMillis: 30000
});

module.exports = pool;