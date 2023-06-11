const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {config} = require("../config/secret");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  date_created: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    default: "user",
  },
  
});

exports.UserModel = mongoose.model("users", userSchema);

exports.validUser = (_bodyData) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(99).required(),
    email: Joi.string().min(2).max(100).email().required(),
    password: Joi.string().min(6).max(50).required(),
  });
  return joiSchema.validate(_bodyData);
};

exports.loginValid = (_bodyData) => {
  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(100).email().required(),
    password: Joi.string().min(6).max(50).required(),
  });
  return joiSchema.validate(_bodyData);
};

exports.getToken = (_userId) => {
  let token = jwt.sign({ _id: _userId }, config.tokenSecret, { expiresIn: "60mins" });
  return token;
};
