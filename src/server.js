const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require("path")

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

// Servir archivos estáticos del frontend 
// comentar al usar desarrollo
app.use(express.static(path.join(__dirname, 'public')));

// Para rutas que no sean API, devolver index.html 
// comentar al usar desarrollo
app.get(/.*/, (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });

// Puerto configurable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
