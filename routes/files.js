const express = require('express')
const mongoose = require('mongoose');
const router = express.Router();
const Grid = require('gridfs-stream');



const Movie = require('../models/Movie');

let gfs = Grid;
const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/kannywoodtv-dev');
conn.once('open', function() {
    gfs = Grid(conn.db, mongoose.mongo);
});

//get all files
router.get('/', (req, res) => {
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
    req.params.filename

});

// get single file
router.get('/:filename', (req, res) => {
    gfs.files.find({
        filename: req.params.filename
    }).toArray(function(err, file) {
        if (err) {
            res.send(err)
        }
if(req.headers['range']){
  let  parts = req.headers['range'].replace(/bytes=/, '').split("-");
  var partialstart = parts[0];
  var partialend = parts[1];
  var start = parseInt(partialstart, 10);
  var end = partialend ? parseInt(partialend, 10) : file[0].length - 1;
  var chunksize = (end - start ) + 1

  res.writeHead(206, {
    'Content-Range': 'bytes ' + start + '-' + end + '/' + file[0].length,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': file[0].contentType
});
  gfs.createReadStream({_id: file[0]._id,
    range: {
      startPos : start,
      endPos: end
    }

  }).pipe(res)
}
else{
 
  res.header('Content-Length', file[0].length);
  res.header('Content-Type', file[0].contentType);

  gfs.createReadStream({
      _id: file[0]._id
  }).pipe(res);
}

    });


});

router.get('/thumbnail/:filename', (req, res) => {
  gfs.files.find({
    filename: req.params.filename
}).toArray(function(err, file) {
    if (err) {
        res.send(err)
    }
    const readstream = gfs.createReadStream(req.params.filename);
    readstream.pipe(res);
});

})


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
