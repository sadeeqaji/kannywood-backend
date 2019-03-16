const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// importing model
const User = require('../models/User');
const Cp = require('../models/Cp');


 //helper funtion for user authentication using passport
module.exports = function(passport) {
    passport.use('user', new LocalStrategy({
        usernameField: 'email'
    }, (email, password, done) => {

        User
            .findOne({
                email: email
            })
            .then(user => {
                if (!user) {
                    return done(null, false, {
                        message: "We couldn't find an account matched to this email"
                    });
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err)
                        throw err;
                    if (isMatch) {
                        return done(null, user);
                        console.log(req.body);
                    } else {
                        return done(null, false, {
                            message: 'Password Incorrect'
                        });
                    }
                });
            });
    }));

    passport.use('cpuser', new LocalStrategy({
        usernameField: 'email'
    }, (email, password, done) => {
        Cp
            .findOne({
                email: email
            })
            .then(user => {
                if (!user) {
                    return done(null, false, {
                        message: "We couldn't find an account matched to this email"
                    });
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err)
                        throw err;
                    if (isMatch) {
                        return done(null, user);
                        //console.log(req.body);
                    } else {
                        return done(null, false, {
                            message: 'Password Incorrect'
                        });
                    }
                });
            });
    }));



function SessionConstructor(userId, userGroup, details) {
  this.userId = userId;
  this.userGroup = userGroup;
  this.details = details;

}

    passport.serializeUser(function (userObject, done) {
    // userObject could be a Model1 or a Model2... or Model3, Model4, etc.
    let userGroup = "model1";
    let userPrototype =  Object.getPrototypeOf(userObject);

    if (userPrototype === User.prototype) {
      userGroup = "model1";
    } else if (userPrototype === Cp.prototype) {
      userGroup = "model2";
    }

    let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
    done(null, sessionConstructor);
    });

  passport.deserializeUser(function (sessionConstructor, done) {

    if (sessionConstructor.userGroup == 'model1') {
      User.findOne({
          _id: sessionConstructor.userId
      }, '-localStrategy.password', function (err, user) { // When using string synlogintax, prefixing a path with - will flag that path as excluded.
          done(err, user);
      });
    } else if (sessionConstructor.userGroup == 'model2') {
      Cp.findOne({
          _id: sessionConstructor.userId
      }, '-localStrategy.password', function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
          done(err, user);

      });
      //console.log(sessionConstructor.userId.);
    }

  });

};
