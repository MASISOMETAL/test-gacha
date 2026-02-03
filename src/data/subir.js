const { Pool } = require('pg');
require('dotenv').config(); // carga variables de entorno desde .env

// Creamos el pool de conexión usando DATABASE_URL o las variables separadas
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // si usás DATABASE_URL
    ssl: { rejectUnauthorized: false }
});

async function crearTablas() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        money INTEGER DEFAULT 5000,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id VARCHAR(10) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        imagen VARCHAR(255),
        rareza VARCHAR(50) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        descripcion TEXT,
        probabilidad NUMERIC(4,2),
        ataque INTEGER DEFAULT 0,
        defensa INTEGER DEFAULT 0,
        velocidad INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        card_id VARCHAR(10) REFERENCES cards(id) ON DELETE CASCADE,
        cantidad INT DEFAULT 1,
        obtained_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (user_id, card_id)
      );
    `);

        console.log("✅ Tablas creadas o ya existentes");
    } catch (err) {
        console.error("❌ Error creando tablas:", err);
    } finally {
        pool.end();
    }
}

crearTablas();
