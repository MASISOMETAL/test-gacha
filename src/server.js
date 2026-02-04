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

app.use('/api/gacha', gachaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

if (isProduction) {
    // cargar cartas
    const { main: cargarCartas } = require('./cargarCartas');

    app.get('/api/debug/cargar-cartas', async (req, res) => {
        try {
            await cargarCartas();
            res.send("✅ Cartas cargadas correctamente");
        } catch (err) {
            res.status(500).send("❌ Error al cargar cartas: " + err.message);
        }
    });

    // borrar todas las cartas 
    app.get('/api/debug/borrar-cards', async (req, res) => {
        try {
            await pool.query("TRUNCATE TABLE cards RESTART IDENTITY CASCADE");
            res.send("🗑️ Tabla 'cards' vaciada correctamente");
        } catch (err) {
            console.error("❌ Error al truncar tabla:", err.message);
            res.status(500).send("❌ Error al borrar cartas: " + err.message);
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
