const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Cp = require("../models/Cp");

const { ensureAuthenticated } = require("../helpers/auth");

const { ensureCp } = require("../helpers/cpuser.js");

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

router.get("/home", ensureAuthenticated, ensureCp, (req, res) => {
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
  Cp.find()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

router.post("/login", passport.authenticate("cpuser"), (req, res) => {
  let user = req.user;
  if (!req.user) {
    res.status(400).send(errors);
    console.log(errors);
  } else {
    const cptoken = jwt.sign(
      {
        userId: req.user._id,
        isVerify: req.user.IsVerified,
        isCp: req.user.isCp
      },
      "somekey",
      {
        expiresIn: "1d"
      }
    );
    console.log(req.user);
    res.send({
      token,
      success: true,
      isAdmin: user.isAdmin,
      isUser: user.isUser,
      isBlocked: user.isBlocked
    });
  }
});

//Register url : user/register
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
  let ErrorLength = Object.keys(errors);
  if (ErrorLength.length > 0) {
    console.log(errors);
    res.send({ success: false, message: errors });
  } else {
    Cp.findOne({
      email: req.body.email
    }).then(user => {
      if (user) {
        console.log("User exist");
        res.send({
          success: false,
          message: "User with this email already exist"
        });
      } else {
        const newUser = new Cp({
          providerName: req.body.providerName,
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
  Cp.findOne({ _id: req.params.id })
    .then(userInfo => {
      res.send(userInfo);
    })
    .catch(err => {
      res.send(err);
    });
});

router.put("/block/:id", (req, res) => {
  Cp.findByIdAndUpdate({ _id: req.params.id }, { $set: { isBlocked: true } })
    .then(response => {
      res.send({ success: true, message: "User blocked", response });
    })
    .catch(error => {
      res.send({ success: false, error: "Can't blocked the user" });
    });
});

router.put("/profile/edit/:id", (req, res) => {
  Cp.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        providerName: req.body.providerName
      }
    }
  )
    .then(EditedInfo => {
      res.send("Updated successfully");
    })
    .catch(err => {
      res.send(err);
    });
});

module.exports = router;
