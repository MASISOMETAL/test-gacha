const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === "production";

let config = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
};

if (isProduction) {
    config = {
        ...config,
        ssl: { rejectUnauthorized: false }
    };
}

const pool = new Pool(config);

module.exports = pool;
