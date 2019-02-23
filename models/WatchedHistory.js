//user registration Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WatchedSchema = new Schema({

    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movies'
    },
    Date: {
      type: Date
    }
});

module.exports = WatchedHistory = mongoose.model('watched', WatchedSchema)
