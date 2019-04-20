const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    MovieName: String,
    description: String,
    category: String,
    token: {
        type: String,
    },
    fileID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fs.files'
    },
    posterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fs.files'
    },
    filename: String,
    thumbnail: String,
    isVerifiedVideo: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0
    },
    featuredMovie:{
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    },

    uploadedDate: {
      type: Date,
    },
    uploadedByUser: String,
});


const Movie = mongoose.model('Movies', MovieSchema);
module.exports = Movie;
