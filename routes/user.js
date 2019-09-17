const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const { ensureAuthenticated } = require("../helpers/auth");

const { ensureUser } = require("../helpers/user.js");

const { ensureAdmin } = require("../helpers/admin");

router.get("/failure", (req, res) => {
  res.send(`login not accepted incorrect login credentials`);
});

//logout: url  user/logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Logout successfully");
  res.redirect("/user/login");
});

router.get("/home", ensureAuthenticated, ensureAdmin, (req, res) => {
  res.send("Home");
  console.log(req.user.id);
});

router.get("/", (req, res) => {
  res.send("Login successfully");
});

router.get("/login", (req, res) => {
  res.send(`you're redirected to login page`);
});

router.get("/register", (req, res) => {
  res.send(`you're redirected to register page`);
});

router.get("/payment", (req, res) => {
  res.send(`you're redirected to payment page`);
});

router.get("/allusers", (req, res) => {
  User.find({}, "name email phoneNumber IsVerified ")
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

router.post("/login", passport.authenticate("user"), (req, res) => {
  if (!req.user) {
    res.send({success: false});
  } else {
    const token = jwt.sign(
      {
        userId: req.user._id,
        isVerify: req.user.IsVerified,
        isAdmin: req.user.isAdmin,
        isUser: req.user.isUser
      },
      "somekey",
      {
        expiresIn: "1d"
      }
    );
    res.send({token, success: true});
  }
});

// Register url : user/register
router.post("/register", (req, res) => {
  let errors = {};
  let failureFlash;
  let success = [];
  let successFlash;
  let email = req.body.email;

  email.toLowerCase();
  if (req.body.password != req.body.password2) {
    errors.passwordMatch = "Password do not match";
  }
  if (req.body.password.length <= 7) {
    errors.ValiidPasstext = "Password length must be at least 8 characters";
  }
  if (!req.body.phoneNumber) {
    errors.ValidPhone = "please provide your phone number";
  }
  let ErroLength = Object.keys(errors);
  if (ErroLength.length > 0) {
    console.log(errors);
    res.send({ success: false, message: errors });
  } else {
    User.findOne({
      email: req.body.email
    }).then(user => {
      if (user) {
        console.log("User exist");
        res.send({
          success: false,
          message: "User with this email already exist"
        });
      } else {
        const newUser = new User({
          name: req.body.name,
          email: email,
          password: req.body.password,
          phoneNumber: req.body.phoneNumber
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                success.push({
                  text:
                    "Registered successfully. Confirmation code has been sent to your email"
                });
                res.send({
                  success: true,
                  message:
                    "Registered successfully. Confirmation code has been sent to your email"
                });
              })
              .catch(err => {
                res.status(500).send(err);
                return;
              });
          });
        });
      }
    });
  }
});

router.get("/profile/:id", (req, res) => {
  User.findOne({ _id: req.params.id })
    .then(userInfo => {
      res.send(userInfo);
    })
    .catch(err => {
      res.send(err);
    });
});

router.put("/profile/edit/:id", (req, res) => {
  if (req.body.name !== null) {
    console.log("not null");
  }
  User.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber
      }
    }
  )
    .then(EditedInfo => {
      res.send(EditedInfo);
    })
    .catch(err => {
      res.send(err);
    });
});

module.exports = router;
