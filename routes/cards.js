const express = require("express");
const _ = require("lodash");
const { Card, validateCard, generateBizNumber } = require("../models/card");
const auth = require("../middleware/auth");
const router = express.Router();

router.delete("/:id", auth, async (req, res) => {
  const card = await Card.findOneAndRemove({
    _id: req.params.id,
    user_id: req.user._id,
  });
  if (!card) {
    return res.status(404).send("The card with the given ID was not found");
  }

  res.send(card);
});

router.put("/:id", auth, async (req, res) => {
  // validate body and return error if invalid
  const { error } = validateCard(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // update card and return error if does not exist
  let card = await Card.findOneAndUpdate(
    {
      _id: req.params.id,
      user_id: req.user._id,
    },
    req.body
  );
  if (!card) {
    return res.send("The card with the given ID was not found");
  }

  // get updated card from db and send to user
  card = await Card.findOne({
    _id: req.params.id,
    user_id: req.user._id,
  });
  res.send(card);
});

router.get("/:id", auth, async (req, res) => {
  const card = await Card.findOne({
    _id: req.params.id,
    user_id: req.user._id,
  });
  if (!card) {
    return res.status(404).send("The card with the given ID was not found!");
  }

  res.send(card);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let card = new Card({
    ...req.body,
    bizImage:
      req.body.bizImage ||
      "https://cdn.pixabay.com/photo/2017/08/21/08/34/animal-2664492_960_720.jpg",
    bizNumber: await generateBizNumber(Card),
    user_id: req.user._id,
  });

  const newCard = await card.save();

  res.send(newCard);
});

module.exports = router;
