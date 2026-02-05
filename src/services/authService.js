// src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../data/db');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || "supersecreto";

// Helper para traer cartas del usuario
async function getUserCards(userId) {
    const cardsRes = await pool.query(
        `SELECT uc.card_id, uc.cantidad, c.nombre, c.rareza, c.imagen
         FROM user_cards uc
         JOIN cards c ON uc.card_id = c.id
         WHERE uc.user_id = $1`,
        [userId]
    );

    return {
        cards: cardsRes.rows,
        cardsCount: cardsRes.rows.reduce((sum, c) => sum + c.cantidad, 0)
    };
}

// Registro con login automático
async function register(email, password) {
    try {
        const hashed = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password, money, role) VALUES ($1, $2, $3, $4) RETURNING id, email, money, role',
            [email, hashed, 5000, 'user'] // 👈 rol por defecto
        );
        const user = result.rows[0];

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });

        // Traemos cartas (vacío al inicio)
        const { cards, cardsCount } = await getUserCards(user.id);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                money: user.money,
                role: user.role,   // 👈 ahora incluimos el rol
                cards,
                cardsCount
            }
        };
    } catch (err) {
        throw new Error("Error al registrar usuario: " + err.message);
    }
}

// Login
async function login(email, password) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        const user = result.rows[0];
        if (!user) throw new Error("Usuario no encontrado");

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error("Contraseña incorrecta");

        const token = jwt.sign({ id: user.id }, SECRET);

        // Traemos cartas del usuario
        const { cards, cardsCount } = await getUserCards(user.id);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                money: user.money,
                role: user.role,   // 👈 incluimos el rol
                cards,
                cardsCount
            }
        };
    } catch (err) {
        throw new Error("Error en login: " + err.message);
    }
}

// Middleware de autenticación
function authMiddleware(req, res, next) {
    const header = req.headers['authorization'];
    if (!header) return res.status(401).json({ error: "Token requerido" });

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token inválido" });
    }
}

module.exports = { register, login, authMiddleware };
