const gachaService = require('../services/gachaService.js');
const pool = require('../data/db');

exports.buy = async (req, res) => {
    try {
        const userId = req.userId;
        const packType = req.query.pack;

        // El service devuelve { newMoney, obtainedCards }
        const { newMoney, obtainedCards } = await gachaService.buyPack(userId, packType);

        // Traemos la colección completa del usuario
        const cardsRes = await pool.query(
            `SELECT uc.card_id, uc.cantidad, c.nombre, c.rareza, c.imagen
             FROM user_cards uc
             JOIN cards c ON uc.card_id = c.id
             WHERE uc.user_id = $1`,
            [userId]
        );

        const userCards = cardsRes.rows;
        const cardsCount = userCards.reduce((sum, c) => sum + c.cantidad, 0);

        res.json({
            newMoney,
            userCards,
            cardsCount,
            obtainedCards
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
