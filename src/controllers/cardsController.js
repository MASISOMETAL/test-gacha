// controllers/cardsController.js
const pool = require("../data/db");

exports.count = async (req, res) => {
    try {
        const result = await pool.query("SELECT COUNT(*) FROM cards");
        const total = parseInt(result.rows[0].count, 10);
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo total de cartas" });
    }
};

exports.getAll = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, nombre, rareza, imagen FROM cards ORDER BY id"
        );
        
        res.json(result.rows); // array de cartas
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo catálogo de cartas" });
    }
};
