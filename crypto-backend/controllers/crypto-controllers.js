const HttpError = require("../models/http-error");
const Crypto = require("../models/crypto");
const { validationResult } = require("express-validator");

const getCryptoCurrencies = async (req, res, next) => {
  let cryptos;
  try {
    cryptos = await Crypto.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching Cryptocurrencies failed, please try again.",
      500
    );
    return next(error);
  }
  res.json({
    cryptos: cryptos.map((crypto) => crypto.toObject({ getters: true })),
  });
};

const getCrypto = async (req, res, next) => {
  const id = req.params.id;
  let crypto;
  try {
    crypto = await Crypto.findById(id);
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

  res.json({ crypto: crypto.toObject({ getters: true }) });
};

const getCryptoByAbbr = async (req, res, next) => {
  const abbr = req.params.abbr;
  let crypto;
  try {
    crypto = await Crypto.findOne({ abbr: abbr });
  } catch (err) {
    const error = new HttpError("Error.. the request failed.", 500);
    return next(error);
  }

  if (!crypto) {
    const error = new HttpError(
      "Error.. the cryptocurrency with that abbr can't be found.",
      404
    );
    return next(error);
  }

  res.json({ crypto: crypto.toObject({ getters: true }) });
};

exports.getCryptoCurrencies = getCryptoCurrencies;
exports.getCryptoByAbbr = getCryptoByAbbr;
exports.getCrypto = getCrypto;
