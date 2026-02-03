// routes/cardsRoutes.js
const express = require("express");
const router = express.Router();
const cardsController = require("../controllers/cardsController");

router.get("/count", cardsController.count);
router.get("/", cardsController.getAll);

module.exports = router;
