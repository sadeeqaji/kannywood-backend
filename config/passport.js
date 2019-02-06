const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// importing model
const User = require('../models/User');

 //helper funtion for user authentication using passport
module.exports = function(passport) {
    passport.use(new LocalStrategy({
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
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};
