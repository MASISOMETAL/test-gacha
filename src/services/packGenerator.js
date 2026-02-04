const boosters = require("./boosters")
const { pickWeighted, pickByProbability } = require('./cardPicker');
const pool = require('../data/db');

// 👉 Nueva función para traer cartas por rareza 
async function getCardsByRareza(rareza) {
    const result = await pool.query("SELECT * FROM cards WHERE rareza=$1", [rareza]);
    return result.rows;
}

async function generatePack(type) {
    const booster = boosters[type];
    if (!booster) throw new Error("Tipo de pack inválido");

    // Traemos todas las colecciones una sola vez
    const comunes = await getCardsByRareza("common");
    const raras = await getCardsByRareza("rare");
    const epicas = await getCardsByRareza("epico");
    const legendarias = await getCardsByRareza("legendary");

    const pack = [];

    for (let i = 0; i < booster.composition.common; i++) {
        pack.push(pickWeighted(comunes));
    }
    for (let i = 0; i < booster.composition.rare; i++) {
        pack.push(pickWeighted(raras));
    }
    for (let i = 0; i < booster.composition.wildcard; i++) {
        pack.push(pickByProbability(raras, epicas, legendarias));
    }    

    return pack;
}

module.exports = { generatePack };