// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../data/db');
const { authMiddleware } = require('../services/authService');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/add-credits', authMiddleware, adminMiddleware, async (req, res) => {
    const { email, amount } = req.body;

    try {
        const userRes = await pool.query("SELECT id, money FROM users WHERE email=$1", [email]);
        const user = userRes.rows[0];
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        const updatedRes = await pool.query(
            "UPDATE users SET money = money + $1 WHERE id=$2 RETURNING id, email, money",
            [amount, user.id]
        );

        res.json({ message: "Créditos agregados", user: updatedRes.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error agregando créditos" });
    }
});

module.exports = router;
