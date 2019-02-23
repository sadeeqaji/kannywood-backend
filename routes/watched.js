const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const WatchedHistory = require("../models/WatchedHistory.js");


router.post('/', (req, res) => {
    WatchedMovie = new WatchedHistory({
        userId: req.body.userId,
        movieId: req.body.movieId,
        Date: Date.now()
    })
    WatchedMovie.save().then(test => {
            res.send(test);
        })
        .catch(err => {
            res.send(err)
        })
});

router.get('/', (req, res) => {
  WatchedHistory.find()
  .populate('movieId')
  .then(files => {
    res.send(files)
  })
});

router.get('/:id', (req, res) => {
  WatchedHistory.find({userId: req.params.id})
  .populate('movieId')
  .then(files => {
      res.send(files)
  })
  .catch(err => {
    res.send(err)
  })
})

module.exports = router;
