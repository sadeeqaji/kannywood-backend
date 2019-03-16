const User = require('../models/User');
module.exports = {
    ensureUser: function(req, res, next) {
      if(!req.user || req.user === null){
          res.send("login please")
      }
      else {

          User.findOne({
              _id: req.user.id
          }).then((user) => {
              //console.log(user.isUser)
              if (user.isUser === false  || user.isUser === null) {
                  res.send("not authorized")
              } else {
                  res.send("authorized")
              }
          })
          .catch((err) => {
            res.send("please login")
          })
      }

    },
}
