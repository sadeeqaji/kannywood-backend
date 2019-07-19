const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path')
const router = express.Router();
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator();
const passport = require('passport');
const compress_images = require('compress-images');

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
        console.log("file received", req.files)
        //compress images before saving
        compressImages(file.originalname);
        return {
            filename: req.body.name + path.extname(file.originalname),
            // metadata: {uploadedByUser: req.body.uploadedByUser, Description: req.body.Description, thumbnail: req.body.name + path.extname(file.originalname) }
        };

    }
});
const upload = multer({
    storage
});

// file upload url files/upload

router.post('/', upload.array('file', 'file'), (req, res) => {
    // console.log(req.files)
    // console.log(req.body);
    // console.log(req.user);
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
        uploadedByUser: req.body.uploadedByUser

    });
    // console.log(movie)
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

// function compressImages(input) {
//     console.log("typeof input gotten", 
//      path.normalize(path.join(__dirname, "../uncompressed/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}")))
   
//     compress_images(path.normalize(path.join(__dirname, "../uncompressed/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}")),
//     path.normalize(path.join(__dirname, "../compressedImages/")), { compress_force: false, statistic: true, autoupdate: true }, false,
//         { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
//         { png: { engine: 'pngquant', command: ['--quality=20-50'] } },
//         { svg: { engine: 'svgo', command: '--multipass' } },
//         { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } }, function (error, completed, statistic) {
//             console.log('-------------');
//             console.log(error);
//             console.log(completed);
//             console.log(statistic);
//             console.log('-------------');
//         });
// }


module.exports = router;
