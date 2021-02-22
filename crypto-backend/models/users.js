const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 5, maxLength: 25 },
  ownedCryptos: [
    [
      { type: String, required: false },
      { type: Number, required: false },
    ],
  ],
  balance: { type: Number, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
