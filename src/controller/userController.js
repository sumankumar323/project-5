const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("../utils/validator");
const aws_config = require("../utils/aws-config");
const userModel = require("../model/userModel");
const saltRounds = 10;

/************************************************CREATE USER API*******************************************/

const registerUser = async (req, res) => {
  try {
    let files = req.files;
    let data = req.body;
    let { fname, lname, email, profileImage, phone, password, address } = data;

    data.profileImage = await aws_config.uploadFile(files[0]);

    data.password = await bcrypt.hash(password, saltRounds);
    //data.password = encryptedPassword;

    let savedData = await userModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "Data created", Data: savedData });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "Error occcured : " + err });
  }
};


/************************************************LOGIN API**********************************************/

let login = async (req, res) => {
    try {
      let data = req.body;
      const { email, password } = data;
  
      if (!Object.keys(data).length) {
        return res
          .status(400)
          .send({ status: false, message: "email & password must be given" });
      }
  
      if (!validator.isValidValue(email)) {
        return res
          .status(400)
          .send({ status: false, messgage: "email is required " });
      }
  
      let checkemail = await userModel.findOne({ email });
  
      if (!validator.isValidValue(password)) {
        return res
          .status(400)
          .send({ status: false, messsge: "password is required" });
      }
  
      // Load hash from your password DB.
      let decryptPassword = await bcrypt.compare(password, checkemail.password);
  
      if (!checkemail || !decryptPassword) {
        return res
          .status(401)
          .send({ status: false, message: "email or password is not correct" });
      }
  
  
      /*-------------------------------------------GENERATE TOKEN----------------------------------------------*/
  
      let date = Date.now();
      let createTime = Math.floor(date / 1000);
      let expTime = createTime + 3000;
  
      let token = jwt.sign(
        {
          userId: checkemail._id.toString(),
          iat: createTime,
          exp: expTime,
        },
        "group40"
      );
  
      res.setHeader("x-api-key", token);
      return res.status(200).send({
        status: true,
        message: "User login successful",
        data: { userId: checkemail._id, token: token },
      });
    } catch (err) {
      res.status(500).send({ status: false, message: err.message });
    }
  };


/************************************************GET USER API*********************************************/

const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({
        status: false,
        message: "Please enter a valid User Id",
      });

    const profile = await userModel.findOne({ _id: userId });

    if (!profile)
      return res.status(404).send({
        status: false,
        message: "User Id doesn't exist.Please enter another Id",
      });

    if (profile._id.toString() !== req.userId)
      return res.status(403).send({
        status: false,
        message: "Unauthorized access! User's info doesn't match",
      });

    return res.status(200).send({
      status: true,
      message: "User record found",
      data: profile,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "Error occcured : " + err });
  }
};

/************************************************UPDATE API*********************************************/

const userUpdation = async (req, res)=> {
  try {
    let userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "write valid ObjectId in params" });
    let data = req.body;
    let files = req.files;

    let { fname, lname, email, profileImage, phone, password, address } = data;
    

    data.profileImage = await aws_config.uploadFile(files[0]);

    let updateData = await userModel.findOneAndUpdate({ _id: userId },
      { address, fname, lname, email,profileImage, phonepassword },{ new: true });
      
    if (!updateData)
      return res.status(404).send({ status: false, message: "No user record found" });

    return res
      .status(200)
      .send({
        status: true,
        message: "User profile updated",
        data: updateData,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};




module.exports = { registerUser, login, getUserDetails, userUpdation };
