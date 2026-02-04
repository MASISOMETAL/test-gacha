const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require("path")
const pool = require('./data/db');

const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.use(cors());
app.use(express.json());

// Importar rutas de gacha
const gachaRoutes = require('./routes/gacha.js');
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require("./routes/cardsRoutes.js")
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/gacha', gachaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/admin', adminRoutes);

if (isProduction) {

    // implementar cambios a la bd

    app.get("/api/update", async (req, res) => {
        try {
            // Crear columna role si no existe 
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';`);

            // Asignar admin a tu usuario 
            await pool.query(`UPDATE users SET role = 'admin' WHERE email = 'cris@gmail.com';`);

            res.json({ message: "Actualización realizada: columna role creada y usuario cris@gmail.com es admin." });
        } catch (err) {
            console.error("Error en /api/update:", err);
            res.status(500).json({ error: err.message });
        }
    });

    // servir frontend 
    const publicPath = path.join(__dirname, 'public', 'dist');
    app.use(express.static(path.join(publicPath)));

    // fallback para SPA (React/Vite)
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
}

// Puerto configurable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
