
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");


const Authentication = function (req, res, next) {
  try {
    if(!req.headers.authorization) {
        return res.status(401).send({ status: false, message: "Missing authentication token in request " });
      }

    let token = req.headers.authorization.split(" ")[1]

    const decoded = jwt.decode(token);
   
    if (!decoded) {
      return res.status(401).send({ status: false, message: "Invalid authentication token in request headers " })
    }
    if (Date.now() > (decoded.exp) * 1000) {
      return res.status(401).send({ status: false, message: "Session expired! Please login again " })
    }

    
    jwt.verify(token, "group40", function (err, decoded) {
      if (err) {
        return res.status(401).send({ status: false, message: "token invalid" });
      }
      else {
        req.userId = decoded.userId;
        return next();
      }
    });

  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};


const Authorization = async (req,res,next) =>{

  let userId = req.params.userId
  let user = await userModel.findById({_id:userId})
 
  if(user._id.toString()!==req.userId){
    return res.status(403).send({status: false,message: "Unauthorized access! User's info doesn't match"})
  }
  next();
}

module.exports={Authentication,Authorization}