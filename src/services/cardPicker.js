// src/services/cardPicker.js
function pickWeighted(cards) {
    const total = cards.reduce((sum, c) => sum + Number(c.probabilidad), 0);
    const roll = Math.random() * total;
    let acc = 0;

    for (const card of cards) {
        acc += Number(card.probabilidad);
        if (roll <= acc) return card;
    }
    return cards[cards.length - 1];
}

// Ahora pickByProbability recibe las colecciones ya cargadas
function pickByProbability(raras, epicas, legendarias) {
    const roll = Math.random();
    if (roll < 0.7) return pickWeighted(raras);
    if (roll < 0.9) return pickWeighted(epicas);
    return pickWeighted(legendarias);
}

module.exports = { pickWeighted, pickByProbability };
