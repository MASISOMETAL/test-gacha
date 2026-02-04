// src/middleware/adminMiddleware.js
const pool = require('../data/db');

async function adminMiddleware(req, res, next) {
    try {
        const userRes = await pool.query("SELECT role FROM users WHERE id=$1", [req.userId]);
        const user = userRes.rows[0];
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: "Acceso denegado" });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: "Error verificando rol" });
    }
}

module.exports = adminMiddleware;
