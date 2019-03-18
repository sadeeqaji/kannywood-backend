const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');


const app = express();

// importing db configurations
const dbconfig = require('./config/dbconfig');


// importing routes
const user = require('./routes/user');
const payment = require('./routes/payment');
const file = require('./routes/files');
const upload = require('./routes/upload');
const movies = require('./routes/movies');
const cp = require('./routes/cp');
const watched = require('./routes/watched');

//passport config
require('./config/passport')(passport);

//mongodb connection
mongoose.connect(dbconfig.dburl, {
        useNewUrlParser: true,
        useCreateIndex: true,
    })
    .then(() => {
      console.log("DB is up and running");
    }).catch((err) => {
      console.log(err);
    })



//body parser middleware
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());

///Express session middleware
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    cookie: {
        maxAge: null
    }
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//CORS middleware
app.use(cors());

//flash middleware
app.use(flash());

//Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_mgs');
    res.locals.error_msg = req.flash('error_mgs');
    res.locals.user = req.user || null;
    next();

});


//routes
app.use('/user', user)
app.use('/upload', upload)
app.use('/files', file)
app.use('/movies', movies)
app.use('/cp', cp)
app.use('/watched', watched)

if(process.env.NODE_ENV === 'production'){
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}


// app.use(express.static(__dirname + '/public'))
//
// // handle every other route with index.html, which will contain
// // a script tag to your application's JavaScript file(s).
// app.get('*', function (req, res){
//   res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
// })


//server
app.listen(dbconfig.port, () => console.log(`running on port ${dbconfig.port}`))
