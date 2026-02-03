const { Pool } = require('pg');

const pool = new Pool({
    user: 'monster',
    host: 'localhost',   // o el nombre del servicio en docker-compose
    database: 'monsterdb',
    password: 'monster123',
    port: 5432,
});

// Función para elegir una carta según su probabilidad
function pickWeighted(pool) {
    const total = pool.reduce((sum, card) => sum + Number(card.probabilidad), 0);
    const roll = Math.random() * total;
    let acc = 0;

    for (const card of pool) {
        acc += Number(card.probabilidad);
        if (roll <= acc) {
            return card;
        }
    }
    return pool[pool.length - 1];
}

// Función para decidir rareza del slot comodín
async function pickByProbability() {
    const roll = Math.random();

    if (roll < 0.7) {
        const raras = await getCardsByRareza("rare");
        return pickWeighted(raras);
    } else if (roll < 0.9) {
        const epicas = await getCardsByRareza("epico");
        return pickWeighted(epicas);
    } else {
        const legendarias = await getCardsByRareza("legendary");
        return pickWeighted(legendarias);
    }
}

// Obtener cartas por rareza desde DB
async function getCardsByRareza(rareza) {
    const result = await pool.query("SELECT * FROM cards WHERE rareza=$1", [rareza]);
    return result.rows;
}

// Generar pack de 5 cartas
async function getPack(packType) {
    let pack = [];

    const comunes = await getCardsByRareza("common");
    const raras = await getCardsByRareza("rare");
    const epicas = await getCardsByRareza("epico");
    const legendarias = await getCardsByRareza("legendary");

    switch (packType) {
        case "common":
            // 3 comun fija
            for (let i = 0; i < 3; i++) pack.push(pickWeighted(comunes));
            // 1 rara fija
            pack.push(pickWeighted(raras));
            // 1 slot comodín
            pack.push(await pickByProbability());
            break

        case "rare":
            // 5 comun fija
            for (let i = 0; i < 5; i++) pack.push(pickWeighted(comunes));
            // 3 rara fija
            for (let i = 0; i < 3; i++) pack.push(pickWeighted(raras));
            // 2 slot comodín
            for (let i = 0; i < 2; i++) pack.push(await pickByProbability());;
            break

        default:
            throw new Error("Tipo de pack inválido en getPack");
    }

    return pack;
}

// Comprar pack
exports.buyPack = async (userId, packType) => {
    // Definir precios
    const precios = {
        common: 10,
        rare: 30,
        epic: 80,
        legendary: 150
    };

    const precio = precios[packType];

    if (!precio) throw new Error("Tipo de pack inválido");

    // Verificar saldo
    const userRes = await pool.query("SELECT money FROM users WHERE id=$1", [userId]);
    const user = userRes.rows[0];
    if (!user || user.money < precio) {
        throw new Error("Saldo insuficiente");
    }

    // Restar saldo
    const newMoneyRes = await pool.query(
        "UPDATE users SET money = money - $1 WHERE id=$2 RETURNING money",
        [precio, userId]
    );
    const newMoney = newMoneyRes.rows[0].money;

    // Generar pack
    const pack = await getPack(packType);

    // Guardar cartas en user_cards
    for (const card of pack) {
        try {
            await pool.query(
                `INSERT INTO user_cards (user_id, card_id, cantidad) 
                    VALUES ($1, $2, 1)
                    ON CONFLICT (user_id, card_id) DO UPDATE SET cantidad = user_cards.cantidad + 1`,
                [userId, card.id]
            );
        } catch (err) {
            console.error("Error insertando carta:", card.id, err.message);
        }
    }


    return { newMoney, obtainedCards: pack };
};
