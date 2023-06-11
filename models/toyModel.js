const mongoose = require("mongoose");
const Joi = require("joi");

const toySchema = new mongoose.Schema({
  name: String,
  cat: String,
  info: String,
  img_url: String,
  price: Number,
  date_created: {
    type: Date,
    default: Date.now(),
  },
  user_id: String,
});


exports.ToyModel = mongoose.model("toys", toySchema);
exports.validToy = (_bodyData) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(99).required(),
    cat: Joi.string().min(2).max(99).required(),
    info: Joi.string().min(2).max(200).required(),
    img_url: Joi.string().min(2).max(300).allow(null, ""),
    price: Joi.number().min(2).max(300).required(),
  });
  return joiSchema.validate(_bodyData);
};
