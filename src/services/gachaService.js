// src/services/gachaService.js
const pool = require('../data/db');
const boosters = require('./boosters');
const { generatePack } = require('./packGenerator');

exports.buyPack = async (userId, packType) => {
    const booster = boosters[packType];
    if (!booster) throw new Error("Tipo de pack inválido");

    // Verificar saldo
    const userRes = await pool.query("SELECT money FROM users WHERE id=$1", [userId]);
    const user = userRes.rows[0];
    if (!user || user.money < booster.price) {
        throw new Error("Saldo insuficiente");
    }

    // Restar saldo
    const newMoneyRes = await pool.query(
        "UPDATE users SET money = money - $1 WHERE id=$2 RETURNING money",
        [booster.price, userId]
    );
    const newMoney = newMoneyRes.rows[0].money;

    // Generar pack
    const pack = await generatePack(packType);    

    // Guardar cartas
    for (const card of pack) {
        await pool.query(
            `INSERT INTO user_cards (user_id, card_id, cantidad) 
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, card_id) DO UPDATE SET cantidad = user_cards.cantidad + 1`,
            [userId, card.id]
        );
    }

    return { newMoney, obtainedCards: pack };
};
