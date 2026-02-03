const { Pool } = require('pg');
require('dotenv').config(); // carga variables de entorno desde .env

// Configuración de conexión usando variables de entorno
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

// Exportamos el pool para usarlo en otros módulos
module.exports = pool;
