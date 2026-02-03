const fs = require('fs');
const path = require('path');
const pool = require('./data/db');

async function cargarCartasDesdeJSON(filePath) {
    const rawData = fs.readFileSync(filePath);
    const cartas = JSON.parse(rawData);

    for (const carta of cartas) {
        const {
            id,
            nombre,
            imagen,
            rareza,
            tipo,
            descripcion,
            probabilidad,
            stats: { ataque, defensa, velocidad }
        } = carta;

        try {
            await pool.query(
                `INSERT INTO cards (id, nombre, imagen, rareza, tipo, descripcion, probabilidad, ataque, defensa, velocidad)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
                [id, nombre, imagen, rareza, tipo, descripcion, probabilidad, ataque, defensa, velocidad]
            );
        } catch (err) {
            console.error(`❌ Error insertando carta ${id}:`, err.message);
        }
    }
}

async function main() {
    const basePath = path.join(__dirname, './data');
    const archivos = [
        'cards-common.json',
        'cards-rare.json',
        'cards-epic.json',
        'cards-legendary.json'
    ];

    for (const archivo of archivos) {
        const fullPath = path.join(basePath, archivo);
        console.log(`📦 Cargando cartas desde: ${archivo}`);
        await cargarCartasDesdeJSON(fullPath);
    }

    console.log("✅ Cartas cargadas correctamente");
}

module.exports = { main };
