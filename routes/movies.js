const express = require('express')
const mongoose = require('mongoose');
const router = express.Router();
const Grid = require('gridfs-stream');
const Fawn = require('fawn');

Fawn.init(mongoose)

const Movie = require('../models/Movie');
const User = require('../models/User');

let gfs
const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/kannywoodtv-dev');
conn.once('open', function() {
    gfs = Grid(conn.db, mongoose.mongo);
});




router.get('/all', (req, res) => {
    Movie.find().then(movies => {
      res.send(movies)
    });
});

//getting the list of movies
router.get('/', (req, res) => {
    Movie.find({isVerifiedVideo: true}).then(movies => {
      res.send(movies)
    });
});

//get the list of featured Movies
router.get('/featuredMovies', (req, res) => {
    Movie.find({featuredMovie: true}).then(movies => {
      res.send(movies)
    });
});

//setting movie to featured movies
router.put('/featuredMovies/:id', (req, res) => {
    Movie.findOneAndUpdate({_id: req.params.id}, {$set: {featuredMovie: true}}).then(sucess => {
      res.send("Set to featured Movies")
    })
    .catch(err => {
      res.send(err)
    });
});



//verify a single movie
router.put('/verify/:id', (req, res) => {
    Movie.findOneAndUpdate({_id: req.params.id}, {$set: {isVerifiedVideo: true}}).then(sucess => {
      res.send("Verify true")
    })
    .catch(err => {
      res.send(err)
    });
});


//getting the list of unverified movies
router.get('/verify', (req, res) => {
  Movie.find({isVerifiedVideo: false}).then(movies => {
    res.send(movies)
  })
});

//deleting a movies
router.delete('/delete/:id', (req, res) => {
  Movie.findByIdAndRemove({_id: req.params.id})
  .then(success => {
    gfs.files.remove({_id: success.fileID})
    gfs.files.remove({_id: success.posterID})
    .run()
    .then(result => {
      res.send("sucess").status(200)
    })
    .catch(err => {
      throw err
    })
  })
  .catch(err => {
    res.send(err)
  })
})



//liking a movies
router.put('/like/:id', (req, res) => {
    Movie.findOneAndUpdate({_id: req.params.id}, {$inc: {rating: 1}}).then(sucess => {
      res.send("success")
    })
    .catch(err => {
      res.send(err)
    })
});


//dislike
router.put('/dislike/:id', (req, res) => {
    Movie.findOneAndUpdate({_id: req.params.id}, {$inc: {rating: -1}}).then(sucess => {
      res.send("success")
    })
    .catch(err => {
      res.send(err)
    });
});

router.get('/similar/:category', (req, res) => {
  Movie.find({category: req.params.category}).then((result) => {
    res.send(result)
  })
  .catch(err => {
    res.send(err)
  })
})

//deleting single file
// router.delete('file/:id', (req, res) => {
//     gfs.files.remove({
//         filename: req.params.filename
//     }).toArray(function(err, files) {
//         if (err) {
//             res.send(err)
//         }
//         res.send("successfully removed");
//         Movie.remove({fileID : req.params.filename})
//         .then((file) => {
//           console.log(file)
//         })
//         .catch(e => { console.log(e)})
//     });
//
// });


module.exports = router;
