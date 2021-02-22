const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cryptoSchema = new Schema({
  name: { type: String, required: true },
  abbr: { type: String, required: true },
  price: { type: Number, required: true },
  change: { type: String, required: true },
  changePercentage: { type: String, required: true },
  marketCap: { type: String, required: true },
});

module.exports = mongoose.model("Crypto", cryptoSchema);
