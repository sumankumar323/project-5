const usermodel = require("../model/usermodel")

//............. create user controller...................

const registeruser = async (req,res) =>{
try{
 const data=req.body;
 const file= req.file;




}
 catch (error) { res.status(500).send({ status: false, msg: error.message });
  }
};