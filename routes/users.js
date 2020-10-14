const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate, validateCards } = require("../models/user");
const { Card } = require("../models/card");
const auth = require("../middleware/auth");
const router = express.Router();

const getCards = async (cardsArray) => {
  return await Card.find({ bizNumber: { $in: cardsArray } });
};

router.get("/cards", auth, async (req, res) => {
  if (!req.query.numbers) {
    return res.status(400).send("Missing numbers data");
  }
  let data = {
    cards: req.query.numbers.split(","),
  };
  const cards = await getCards(data.cards);
  res.send(cards);
});

router.patch("/cards", auth, async (req, res) => {
  // Validate body
  const { error } = validateCards(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // validate bizNumbers
  const cards = await getCards(req.body.cards);
  if (cards.length !== req.body.cards.length) {
    return res.status(400).send("Card number does not match");
  }

  // update user cards
  let user = await User.findById(req.user._id);
  user.cards = user.cards
    ? [...new Set([...req.body.cards, ...user.cards])]
    : req.body.cards;
  user = await user.save();
  res.send(user);
});
// [...new Set([array to filter unique])]

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("Email is taken");

  user = new User(req.body);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  res.send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
