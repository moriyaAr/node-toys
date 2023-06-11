const express = require("express");
// var LocalStorage = require("calstorage").LocalStorage,
//   localStorage = new LocalStorage("./scratch");
const router = express.Router();
const {
  UserModel,
  validUser,
  loginValid,
  getToken,
} = require("../models/userModel");
const { auth } = require("../middlewares/auth");
const bcrypt = require("bcrypt");

router.get("/", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 5;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";

  let reverse = req.query.reverse == "yes" ? -1 : 1;
  try {
    let data = await UserModel.find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse });
    res.json(data);
  } catch {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.get("/userInfo", auth, async (req, res) => {
  let user = await UserModel.findOne(
    { _id: req.tokenDate._id },
    { password: 0 }
  );

  res.json(user);
});

router.get("/myEmail", auth, async (req, res) => {
  let user = await UserModel.findOne({ _id: req.tokenDate._id }, { email: 1 });
  res.json(user);
});

router.post("/", async (req, res) => {
  let validBody = validUser(req.body);
  console.log(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    user.password = "*******";

    res.status(201).json(user);
  } catch (err) {
    if (err.code == 11000) {
      return res
        .status(400)
        .json({ msg: "Email already in system try again", code: 11000 });
    }
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.post("/login", async (req, res) => {
  let valdiateBody = loginValid(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ msg: "User and password not match 1" });
    }

    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ msg: "User and password not match 2" });
    }

    let newToken = getToken(user._id);
    localStorage.setItem("token", newToken);
    console.log(newToken);
    res.json({ your_token: newToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.delete("/:idDel", async (req, res) => {
  try {
    let idDel = req.params.idDel;
    let data = await UserModel.deleteOne({ _id: idDel });
    res.json(data);
  } catch {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.put("/:idEdit", async (req, res) => {
  let validBody = validUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let idEdit = req.params.idEdit;
    let data = await UserModel.updateOne({ _id: idEdit }, req.body);
    res.json(data);
  } catch {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});
module.exports = router;
