const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const {
    ensureAuthenticated,
} = require('../helpers/auth')

const {
    ensureUser
} = require('../helpers/user.js')

const {
    ensureAdmin,
} = require('../helpers/admin')


router.get('/failure', (req, res) => {
    res.send(`login not accepted incorrect login credentials`)
});

//logout: url  user/logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logout successfully');
    res.redirect('/user/login');
})

router.get('/home', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.send("Home")
    console.log(req.user.id)
})

router.get('/', (req, res) => {

    res.send("Login successfully");
});

router.get('/login', (req, res) => {
    res.send(`you're redirected to login page`)
});

router.get('/register', (req, res) => {
    res.send(`you're redirected to register page`)
});

router.get('/payment', (req, res) => {
    res.send(`you're redirected to payment page`)
});

router.get('/allusers', (req, res) => {
  User.find({}, 'name email phoneNumber IsVerified ').then((result) => {
    res.send(result)
  })
  .catch(err => {
    res.send(err)
  })
})




router.post('/login', passport.authenticate('user', ),
  (req, res) => {
    if(!req.user) {
      res.status(400).send(errors)
      console.log(errors)
    }
    else{

    const token =  jwt.sign({
        // email: req.user.email,
        // name: req.user.name,
        // phoneNumber: req.user.phoneNumber,
        userId: req.user._id,
        isVerify: req.user.IsVerified,
        isAdmin: req.user.isAdmin,
        isUser: req.user.isUser,


      },
      "somekey",
      {
        expiresIn: "1d"
      })
      //console.log(req.user);
    res.status(200).send(token)
    }
  },
);

//Register url : user/register
router.post('/register', (req, res) => {
    let errors = [];
    let failureFlash;
    let success = [];
    let successFlash;
    let email = req.body.email

    email.toLowerCase()
    if (req.body.password != req.body.password2) {
        errors.push({
            text: "Password do not match"
        });
    }
    if (req.body.password.length <= 7) {
        errors.push({
            text: "Password length must be at least 8 characters"
        });
    }
    if(!req.body.phoneNumber) {
      errors.push({
        text: "please provide your phone number"
      });
    }
    if (errors.length > 0) {
        errors.push({erro: true})
        res.send(errors)

    } else {
        User
            .findOne({
                email: req.body.email
            })
            .then((user) => {
                if (user) {
                      errors.push({text: "User with this email already exist"})
                      failureFlash: true
                     res.status(422).send(errors)
                } else {
                    const newUser = new User({
                        name: req.body.name,
                        email: email,
                        password: req.body.password,
                        phoneNumber: req.body.phoneNumber
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err)
                                throw err;
                            newUser.password = hash
                            newUser
                                .save()
                                .then((user) => {
                                    success.push({text: 'Registered successfully. Confirmation code has been sent to your email'})
                                    res.status(200).send({success: true})
                                })
                                .catch((err) => {
                                    res.status(500).({text err})
                                    console.log(err)
                                    return
                                });
                        });
                    });
                }
            });
      }
});


router.get('/profile/:id', (req, res) => {
    User.findOne({_id: req.params.id})
    .then((userInfo) => {
        res.send(userInfo)
    })
    .catch((err) => {
        res.send(err)
    })
})

router.put('/profile/edit/:id', (req, res) => {
   User.findOne({_id: req.params.id}).then((uneditedData) => {
        console.log(uneditedData)
        res.send(uneditedData)
   })
   .catch((err) => {
        console.log(err)
        res.send(uneditedData)
   })
})



module.exports = router
