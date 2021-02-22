const express = require("express");
const { check } = require("express-validator");

const userControllers = require("../controllers/user-controller");

const router = express.Router();
// todo: when adding crypto that's already in, update amount
router.post("/addCrypto", userControllers.addCrypto);

router.post("/sellCrypto", userControllers.sellCrypto);

router.get("/getUser/:uid", userControllers.getUser);

router.get("/userCryptos/:uid", userControllers.userCryptos);

router.post("/signup", [
  check("email").normalizeEmail().isEmail(),
  check("password").not().isEmpty().isLength({ min: 5, max: 21 }),
  userControllers.signup,
]);

router.post("/getPortfolio", userControllers.getPortfolio);

router.post("/login", userControllers.login);

router.post("/addBalance", userControllers.addBalance);

router.delete("/delete", userControllers.deleteUser);

module.exports = router;
