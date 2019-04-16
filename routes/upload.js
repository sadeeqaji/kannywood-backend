const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path')
const router = express.Router();
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator();


// to generate unique token for each uploaded file
let token;
uidgen
    .generate()
    .then(uid => token = uid);

const Movie = require('../models/Movie');

const GridFsStorage = require('multer-gridfs-storage');

const storage = new GridFsStorage({
    url: 'mongodb://127.0.0.1:27017/kannywoodtv-dev',
    file: (req, file) => {
        return {
            filename: req.body.name + path.extname(file.originalname),
            metadata: {Description: req.body.Description, thumbnail: req.body.name + path.extname(file.originalname)},
        };

    }
});
const upload = multer({
    storage
});

// file upload url files/upload

router.post('/', upload.array('file', 'file'), (req, res) => {
    console.log(req.files)
    metadata: req.body.name
    const movie = new Movie({
        MovieName: req.body.name,
        description: req.body.Description,
        category: req.body.Category,
        token: token,
        fileID:  req.files[0].id,
        posterID:  req.files[1].id,
        filename: req.files[0].filename,
        thumbnail: req.files[1].filename,
        uploadedDate: Date.now(),
        uploadedByUserId: req.body.userId
    });
    console.log(movie)
    movie.save(function(err) {
        if (err) {
            console.log(err);
            return;
        }

        res.send({
            "success": "true"
        });
    });
});


router.get('/movies', (req, res) => {
  Movie.find()
  .then(movies => {
    res.send(movies)
  })
  .catch(err => {
    res.send(err)
  })
});

module.exports = router;
