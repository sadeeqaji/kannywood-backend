//helper function to ensure the user is admin.

const User = require('../models/User');
module.exports = {
    ensureAdmin: function(req, res, next) {
        User.findOne({
            _id: req.user.id
        }).then((user) => {
            console.log(user.isAdmin)
            if (user.isAdmin === false) {
                res.send("not authorized")
            } else {
                res.send("authorized")
            }
        });

    },
}
