const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const { ensureAuthenticated } = require("../helpers/auth");
const { verifyToken } = require("../helpers/VerifyToken");

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
  User.find()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

router.post("/login", passport.authenticate("user"), (req, res) => {
  let user = req.user;
  if (!req.user) {
    res.send({ success: false });
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
    res.send({
      token,
      success: true,
      isAdmin: user.isAdmin,
      isUser: user.isUser,
      isBlocked: user.isBlocked,
      userDetails: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        Id: user._id
      }
    });
  }
});

// Register url : user/register
router.post("/register", (req, res) => {
  let errors = {};
  let success = [];
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

router.get("/verify/:token", verifyToken, (req, res) => {
  res.send({ message: "Authorized", success: true });
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

router.get("/allusers", (req, res) => {
  User.find({})
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

router.put("/block/:id", (req, res) => {
  User.findByIdAndUpdate({ _id: req.params.id }, { $set: { isBlocked: true } })
    .then(response => {
      res.send({ success: true, message: "User blocked", response });
    })
    .catch(error => {
      res.send({ success: false, error: "Can't blocked the user" });
    });
});

router.put("/unblock/:id", (req, res) => {
  User.findByIdAndUpdate({ _id: req.params.id }, { $set: { isBlocked: false } })
    .then(response => {
      res.send({ success: true, message: "User unblocked", response });
    })
    .catch(error => {
      res.send({ success: false, error: "Can't blocked the user" });
    });
});

router.put("/admin/:id", (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { isAdmin: true, isUser: false } }
  )
    .then(response => {
      res.send({
        success: true,
        message: "User has role is now Admin",
        response
      });
    })
    .catch(error => {
      res.send({ success: false, error: "An error occur" });
    });
});

//Change user detail
router.put("/profile/edit/:id", (req, res) => {
  User.findOne({ _id: req.params.id })
    .then(userData => {
      let userDetails = {
        name: req.body.name ? req.body.name : userData.name,
        email: req.body.email ? req.body.email : userData.email,
        phoneNumber: req.body.phoneNumber
          ? req.body.phoneNumber
          : userData.phoneNumber
      };
      User.updateOne({ _id: req.params.id }, userDetails)
        .then(response => {
          res.send({ success: true, data: userDetails, error: null });
        })
        .catch(err => {
          res.send({ success: false, data: null, error: err });
        });
    })
    .catch(err => {
      res.send({ success: false, data: null, error: err });
    });
});

//Change password
router.put("/profile/password/:id", (req, res) => {
  User.findOne({ _id: req.params.id }).then(userData => {
    bcrypt.compare(
      req.body.oldPassword,
      userData.password,
      (error, matched) => {
        if (!error && matched) {
          if (req.body.newPassword === req.body.confirmPassword) {
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(req.body.newPassword, salt, (err, hashedPassword) => {
                let updated = {
                  IsVerified: userData.IsVerified,
                  isAdmin: userData.isAdmin,
                  isCp: userData.isCp,
                  Subscription: userData.Subscription,
                  isUser: userData.isUser,
                  isBlocked: userData.isBlocked,
                  _id: userData._id,
                  name: userData.name,
                  email: userData.email,
                  password: hashedPassword,
                  phoneNumber: userData.phoneNumber
                };
                User.updateOne({ _id: req.params.id }, updated).then(
                  response => {
                    let userDetails = {
                      IsVerified: userData.IsVerified,
                      isAdmin: userData.isAdmin,
                      isCp: userData.isCp,
                      Subscription: userData.Subscription,
                      isUser: userData.isUser,
                      isBlocked: userData.isBlocked,
                      _id: userData._id,
                      name: userData.name,
                      email: userData.email,
                      phoneNumber: userData.phoneNumber
                    };
                    res.send({
                      success: true,
                      data: userDetails,
                      message: null,
                      error: null
                    });
                  }
                ).catch(error => {
                  res.send({
                    success: false,
                    message: "Internal server error",
                    error: "Could not find the user with the id specified"
                  });
                })
              });
            });
          } else {
            res.send({
              success: false,
              message: "Passwords do not match",
              error: null
            });
          }
        } else if (!matched) {
          res.send({
            success: false,
            message: "Incorrect password",
            error: null
          });
        }
      }
    );
  }).catch(error => {
    res.send({
      success: false,
      message: "Internal server error",
      error: "Could not find the user with the id specified"
    });
  })
});


module.exports = router;
