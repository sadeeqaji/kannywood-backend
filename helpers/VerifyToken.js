const { verify } = require("jsonwebtoken")

const User = require("../models/User");

// const getToken = req => {
//   let token = null;
//   if (!req.header["key"]) {
//     token = null;
//   } else {
//     token = req.headers["key"];
//   }
//   return token;
// };

const validateToken = token => {
  if (!token) {
    return false;
  }

  const payload = verify(token, "somekey");
  
   return User.findById({ _id: payload.userId }).then(user => {
      console.log(user, "USER")
    if (!user) {
      return false;
    }
    return true;
  });
};

exports.verifyToken = async(req, res, next) => {
  try {
    let token = req.params.token;
    const validatedToken = await validateToken(token);
    console.log(validatedToken, "dd")
    if (!validatedToken) {
        console.log(validatedToken)
      return res.send({ success: false, message: "unauthorized" });
    } 
      next();
  } catch (error) {
      res.status(400).send({
          success: false,
          message:"Bad Request",
          error
      })
  }
};
