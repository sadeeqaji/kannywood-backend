const Cp = require('../models/Cp');
module.exports = {
    ensureCp: function(req, res, next) {
      if(!req.user || req.user === null){
          res.send("login please")
      }
      else {

          Cp.findOne({
              _id: req.user.id
          }).then((user) => {
              //console.log(user.isUser)
              if (user.isCp === false  || user.isUser === null) {
                  res.send("not authorized")
              } else {
                  res.send("authorized")
              }
          })
          .catch((err) => {
            res.send("Please Login")
          })
      }

    },
}
