const express = require('express')
const mongoose = require('mongoose');
const router = express.Router();
const Grid = require('gridfs-stream');

const Movie = require('../models/Movie');

let gfs
const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/kannywoodtv-dev');
conn.once('open', function() {
    gfs = Grid(conn.db, mongoose.mongo);
});

//get all files
router.get('/', (req, res) => {
  // console.log(req.user)
    gfs.files.find().toArray(function(err, files) {
        if (err) {
            res.send(err)
        }
        else{
          files.map(file => {
            if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
              file.isPoster = true
            }
            else {
              file.isPoster = false;
            }
          })
        }
        res.send(files);
    });


});

//get single file
router.get('/:filename', (req, res) => {
    gfs.files.find({
        filename: req.params.filename
    }).toArray(function(err, file) {
        if (err) {
            res.send(err)
        }
        const readstream = gfs.createReadStream(req.params.filename);
        readstream.pipe(res);
    });


});

//deleting single file
router.delete('file/:id', (req, res) => {
    gfs.files.remove({
        filename: req.params.filename
    }).toArray(function(err, files) {
        if (err) {
            res.send(err)
        }
        res.send("successfully removed");
        Movie.remove({fileID : req.params.filename})
        .then((file) => {
          console.log(file)
        })
        .catch(e => { console.log(e)})
    });

});


module.exports = router;
