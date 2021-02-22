const express = require("express");

const cryptoControllers = require("../controllers/crypto-controllers.js");

const router = express.Router();

router.get("/get/:id", cryptoControllers.getCrypto);
router.get("/getByAbbr/:abbr", cryptoControllers.getCryptoByAbbr);
router.get("/", cryptoControllers.getCryptoCurrencies);
module.exports = router;
