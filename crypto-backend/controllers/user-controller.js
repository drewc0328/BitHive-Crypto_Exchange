const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const User = require("../models/users");
const Crypto = require("../models/crypto");

// Todo: When adding a crypto that is already in database, update amount else add the crypto itself with amount
const addCrypto = async (req, res, next) => {
  const { id, abbr, amount } = req.body;
  let user;

  if (amount <= 0) {
    const error = new HttpError(
      "Please Enter an Amount that greater than 0!",
      404
    );
    return next(error);
  }

  try {
    user = await User.findById(id);
  } catch (err) {
    const error = new HttpError("Error.. the request didn't go through", 404);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Error.. the user doesn't exist", 500);
    return next(error);
  }

  let crypto;
  try {
    crypto = await Crypto.findOne({ abbr: abbr });
  } catch (err) {
    const error = new HttpError("Error.. the request failed.", 500);
    return next(error);
  }

  if (!crypto) {
    const error = new HttpError(
      "Error.. the cryptocurrency with that name can't be found.",
      404
    );
    return next(error);
  }

  const previousBalance = user.balance;
  user.balance -= crypto.price * amount;
  if (user.balance < 0) {
    user.balance = previousBalance;
    const error = new HttpError(
      "Error.. the users balance is insufficient for this transaction",
      500
    );
    return next(error);
  }

  userCryptoDict = {};
  user.ownedCryptos.map(([key, value]) => {
    userCryptoDict[key] = value;
  });

  if (!(abbr in userCryptoDict)) {
    user.ownedCryptos.push([abbr, amount]);
  } else {
    const userCryptos = [...user.ownedCryptos];
    const userCryptoIndex = userCryptos.findIndex(
      (crypto) => crypto[0] === abbr
    );
    const currentAmount = parseFloat(userCryptos[userCryptoIndex][1]);
    userCryptos[userCryptoIndex] = [abbr, currentAmount + amount];
    user.ownedCryptos = userCryptos;
  }

  user.save();

  res.json({ user: user });
};

// Finished
const sellCrypto = async (req, res, next) => {
  const { id, abbr, amount } = req.body;
  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    const error = new HttpError("Error.. the request didn't go through", 404);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Error.. the user doesn't exist", 500);
    return next(error);
  }

  let crypto;
  try {
    crypto = await Crypto.findOne({ abbr: abbr });
  } catch (err) {
    const error = new HttpError("Error.. the request failed.", 500);
    return next(error);
  }

  if (!crypto) {
    const error = new HttpError(
      "Error.. the cryptocurrency with that name can't be found.",
      404
    );
    return next(error);
  }

  // Find the crypto that will be sold
  userCryptoDict = {};
  user.ownedCryptos.map(([key, value]) => {
    userCryptoDict[key] = value;
  });

  if (!(abbr in userCryptoDict)) {
    const error = new HttpError(
      "Error.. the cryptocurrency with that name can't be found.",
      404
    );
    return next(error);
  }

  // The amount being sold is greater than the amount to sell, resulting in an error
  if (amount > userCryptoDict[abbr]) {
    const error = new HttpError(
      "The amount of cryptocurrencies to sell can't be larger than the amount in possession",
      500
    );
    return next(error);
  } else if (amount == userCryptoDict[abbr]) {
    //The amount being sold will remove the cryptocurrency from the user's inventory
    newUserCrypto = user.ownedCryptos.filter((crypto) => crypto[0] !== abbr);
    user.ownedCryptos = newUserCrypto;
  } else {
    let userCryptos = [...user.ownedCryptos];
    let userCryptoIndex = userCryptos.findIndex((crypto) => crypto[0] == abbr);
    let newAmount = parseFloat(userCryptoDict[abbr]) - amount;
    userCryptos[userCryptoIndex] = [abbr, newAmount];
    user.ownedCryptos = userCryptos;
  }

  //Handle adding to the balance
  user.balance += crypto.price * amount;

  user.save();

  res.json({ user: user });
};

const getUser = async (req, res, next) => {
  const id = req.params.uid;
  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    const error = new HttpError("Error.. the request didn't go through", 404);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Error.. the user doesn't exist", 500);
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const addBalance = async (req, res, next) => {
  const { email, amount } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Error.. the request didn't go through", 404);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Error.. the user doesn't exist", 500);
    return next(error);
  }

  user.balance += amount;
  user.save();
  res.json({ message: `The amount of ${amount} was added to the user` });
};

const deleteUser = async (req, res, next) => {
  const { email } = req.body;
  let user;
  try {
    user = await User.findOneAndRemove({ email: email });
  } catch (err) {
    const error = new HttpError("Error.. the request failed", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Error.. the user can't be found", 500);
    return next(error);
  }

  res.json({ message: "The user was deleted!" });
};

const userCryptos = async (req, res, next) => {
  const id = req.params.uid;
  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    const error = new HttpError("Error.. the request failed", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Error.. the user can't be found", 500);
    return next(error);
  }

  res.json({ ownedCryptos: user.ownedCryptos });
};

const signup = async (req, res, next) => {
  const { email, password } = req.body;

  if (password.length < 5) {
    return next(
      new HttpError("Password must be between 5 and 25 characters", 422)
    );
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "A user with that email already exists, please signup with a different email",
      422
    );
    return next(error);
  }

  // const saltRounds = 10;
  // passwordHash = "";

  // try {
  //   const bcryptHash = await bcrypt.hash(password, saltRounds);
  //   passwordHash = bcryptHash;
  // } catch (err) {
  //   const error = new HttpError("Error signing up the user", 422);
  //   return next(error);
  // }

  const createdUser = new User({
    email,
    password: password,
    balance: 100000,
    ownedCryptos: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up user failed, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Invalid email, please try again", 401);
    return next(error);
  }

  if (user.password !== password) {
    const error = new HttpError("Invalid password, please try again", 401);
    return next(error);
  }

  // bcrypt.compare(password, user.password, function (err, result) {
  //   if (!result) {
  //     const error = new HttpError("Invalid password, please try again", 401);
  //     return next(error);
  //   }
  // });

  res.json({ user: user.toObject({ getters: true }) });
};

const getPortfolio = async (req, res, next) => {
  const { id } = req.body;

  let user;
  try {
    user = await User.findOne({ _id: id });
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Couldn't find a user by that ID", 500);
    return next(error);
  }

  const cryptoDict = {};
  user.ownedCryptos.forEach(([key, value]) => (cryptoDict[key] = value));

  let cryptos;
  try {
    cryptos = await Crypto.find({});
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }

  portfolioList = [];

  cryptos.forEach((c) => {
    if (c.abbr in cryptoDict) {
      portfolioList.push({
        abbr: c.abbr,
        name: c.name,
        price: c.price,
        amount: cryptoDict[c.abbr],
      });
    }
  });

  res.status(201).json({ portfolioList: portfolioList });
};

exports.userCryptos = userCryptos;
exports.sellCrypto = sellCrypto;
exports.addBalance = addBalance;
exports.deleteUser = deleteUser;
exports.addCrypto = addCrypto;
exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
exports.getPortfolio = getPortfolio;
