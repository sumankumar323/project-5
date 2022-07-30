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

    if (!validator.isValidRequest(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Body can not be empty" });
    }

    let { fname, lname, email, profileImage, phone, password ,address } = data;

    if (!validator.isValidValue(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "Fname is required" });
    }

    if (!validator.isValidName(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "Fname may contain only letters. Digits & Spaces are not allowed " });
    }

    if (!validator.isValidValue(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "Lname is required" });
    }

    if (!validator.isValidName(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "Lname may contain only letters. Digits & Spaces are not allowed" });
    }

    if (!validator.isValidValue(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is required" });
    }

    if (!validator.isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Entered email is invalid" });
    }

    let emailExist = await userModel.findOne({ email });
    if (emailExist) {
      return res
        .status(400)
        .send({ status: false, message: "This email already exists" });
    }


    if (!validator.isValidValue(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Phone is required" });
    }

    if (!validator.isValidPhone(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Entered phone number is invalid" });
    }

    let phoneExist = await userModel.findOne({ phone });
    if (phoneExist) {
      return res
        .status(400)
        .send({ status: false, message: "Phone number already exists" });
    }

    if (!validator.isValidValue(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }

    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({
        status: false,
        message: "password length should be between 8 to 15",
      });
    }
    
    data.password = await bcrypt.hash(password, saltRounds);

    //ADDRESS VALIDATION

    // if (!validator.isValidValue(data.address)) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Address is required" });
    // }
    // address = JSON.parse(data.address)
    // console.log(address)
    // //shipping address validation
    // if (address.shipping) {
    //   if (address.shipping.street) {
    //     if (!validator.isValidRequest(address.shipping.street)) {
    //       return res.status(400).send({
    //         status: false,
    //         message: "Shipping address's Street Required",
    //       });
    //     }
    //   } else {
    //     return res.status(400).send({
    //       status: false,
    //       message:
    //         " Invalid request parameters. Shipping address's street cannot be empty",
    //     });
    //   }

    //   if (address.shipping.city) {
    //     if (!validator.isValidRequest(address.shipping.city)) {
    //       return res
    //         .status(400)
    //         .send({ status: false, message: "Shipping address city Required" });
    //     }
    //   } else {
    //     return res.status(400).send({
    //       status: false,
    //       message:
    //         "Invalid request parameters. Shipping address's city cannot be empty",
    //     });
    //   }
    //   if (address.shipping.pincode) {
    //     if (!validator.isValidRequest(address.shipping.pincode)) {
    //       return res.status(400).send({
    //         status: false,
    //         message: "Shipping address's pincode Required",
    //       });
    //     }
    //   } else {
    //     return res.status(400).send({
    //       status: false,
    //       message:
    //         "Invalid request parameters. Shipping address's pincode cannot be empty",
    //     });
    //   }
    // } else {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Shipping address cannot be empty." });
    // }
    // // Billing Address validation
    // if (address.billing) {
    //   if (address.billing.street) {
    //     if (!validator.isValidRequest(address.billing.street)) {
    //       return res.status(400).send({
    //         status: false,
    //         message: "Billing address's Street Required",
    //       });
    //     }
    //   } else {
    //     return res.status(400).send({
    //       status: false,
    //       message:
    //         " Invalid request parameters. Billing address's street cannot be empty",
    //     });
    //   }
    //   if (address.billing.city) {
    //     if (!validator.isValidRequest(address.billing.city)) {
    //       return res.status(400).send({
    //         status: false,
    //         message: "Billing address's city Required",
    //       });
    //     }
    //   } else {
    //     return res.status(400).send({
    //       status: false,
    //       message:
    //         "Invalid request parameters. Billing address's city cannot be empty",
    //     });
    //   }
    //   if (address.billing.pincode) {
    //     if (!validator.isValidRequest(address.billing.pincode)) {
    //       return res.status(400).send({
    //         status: false,
    //         message: "Billing address's pincode Required ",
    //       });
    //     }
    //   } else {
    //     return res.status(400).send({
    //       status: false,
    //       message:
    //         "Invalid request parameters. Billing address's pincode cannot be empty",
    //     });
    //   }
    // } else {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Billing address cannot be empty." });
    // }





    if (!data.address || !isNaN(data.address)) {
      return res.status(400).send({ status: false, message: "Valid address is required" })
  }
      try{
        address = JSON.parse(data.address)
      }catch(err){
        console.log(err.message)
       return res.status(400).send({status: false,  message: `Address should be in valid object format`})
      }
    

  if (!address.shipping || !address.billing) {
      return res.status(400).send({ status: false, message: "shipping and billing address required" })

  }
  
  if (!address.shipping.street || !address.billing.street) {
      return res.status(400).send({ status: false, message: "street is  required " })

  }
  if (!address.shipping.city || !address.billing.city) {
      return res.status(400).send({ status: false, message: "city is  required" })

  }
  if (!address.shipping.pincode || !address.billing.pincode) {
      return res.status(400).send({ status: false, message: "pincode is  required " })

  }
  
  let Sstreet = address.shipping.street
  let Scity = address.shipping.city
  let Spincode = parseInt(address.shipping.pincode)     //shipping
  if (Sstreet) {
      let validateStreet = /^[a-zA-Z0-9]/
      if (!validateStreet.test(Sstreet)) {
          return res.status(400).send({ status: false, message: "enter valid street name in shipping" })
      }
  }

  if (Scity) {
      let validateCity = /^[a-zA-Z0-9]/
      if (!validateCity.test(Scity)) {
          return res.status(400).send({ status: false, message: "enter valid city name in shipping" })
      }
  }
  if (Spincode) {
      let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/     //must not start with 0,6 digits and space(optional)
      if (!validatePincode.test(Spincode)) {
          return res.status(400).send({ status: false, message: "enter valid pincode in shipping" })
      }
  }


  let Bstreet = address.billing.street
  let Bcity = address.billing.city                             //billing
  let Bpincode = parseInt(address.billing.pincode)
  if (Bstreet) {
      let validateStreet = /^[a-zA-Z0-9]/
      if (!validateStreet.test(Bstreet)) {
          return res.status(400).send({ status: false, message: "enter valid street name in shipping" })
      }
  }

  if (Bcity) {
      let validateCity = /^[a-zA-Z0-9]/
      if (!validateCity.test(Bcity)) {
          return res.status(400).send({ status: false, message: "enter valid city name in shipping" })
      }
  }
  if (Bpincode) {
      let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/     //must not start with 0,6 digits and space(optional)
      if (!validatePincode.test(Bpincode)) {
          return res.status(400).send({ status: false, message: "enter valid pincode in shipping" })
      }
  }
  
  data.address = address

    //validation ends

    if (Object.keys(data).includes(profileImage)) {
      return res
        .status(400)
        .send({ status: false, message: "ProfileImage is required" });
    }


    if (files.length > 0) {
      data.profileImage = await aws_config.uploadFile(files[0]);
    } else {
      return res
        .status(400)
        .send({ status: false, message: "ProfileImage File is required" });
    }

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

    if (!validator.isValidRequest(data)) {
      return res
        .status(400)
        .send({ status: false, message: "email & password must be given" });
    }

    if (!validator.isValidValue(email)) {
      return res
        .status(400)
        .send({ status: false, messgage: "Email is required " });
    }

    let checkemail = await userModel.findOne({ email:email });

    if (!checkemail) {
      return res
        .status(404)
        .send({ status: false, message: "Email not found" });
    }

    if (!validator.isValidValue(password)) {
      return res
        .status(400)
        .send({ status: false, messsge: "Password is required" });
    }

    // Load hash from your password DB.
    let decryptPassword = await bcrypt.compare(password, checkemail.password);

    if (!decryptPassword) {
      return res
        .status(401)
        .send({ status: false, message: "Password is not correct" });
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
    if (!validator.isValidObjectId(userId))
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

//************************************************UPDATE API*********************************************/

const userUpdation = async (req, res) => {
  try {
    let userId = req.params.userId;

    if (!validator.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Enter valid ObjectId in params" });

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

    let data = req.body;
    let files = req.files;

    let { fname, lname, email, profileImage, phone, password, address } = data;

    if (Object.keys(data).includes("fname")) {
      
      if (!validator.isValidValue(fname)) {
        return res
          .status(400)
          .send({ status: false, message: "Fname can not be empty" });
      }
      if (!validator.isValidName(fname)) {
        return res
          .status(400)
          .send({ status: false, message: "Fname may contain only letters. Digits & Spaces are not allowed" });
      }
    }

    if (Object.keys(data).includes("lname")) {
      if (!validator.isValidValue(lname)) {
        return res
          .status(400)
          .send({ status: false, message: "Lname can not be empty" });
      }
      if (!validator.isValidName(lname)) {
        return res
          .status(400)
          .send({ status: false, message: "Lname may contain only letters. Digits & Spaces are not allowed" });
      }
    }

    if (Object.keys(data).includes("email"))  {
      if (!validator.isValidEmail(email)) {
        return res
          .status(400)
          .send({ status: false, message: "Entered email is invalid or empty" });
      }
    }

    let emailExist = await userModel.findOne({ email });
    if (emailExist) {
      return res
        .status(400)
        .send({ status: false, message: "This email already exists" });
    }

    if (Object.keys(data).includes("phone"))  {
      if (!validator.isValidPhone(phone)) {
        return res
          .status(400)
          .send({ status: false, message: "Entered phone number is invalid or empty" });
      }
    }

    let phoneExist = await userModel.findOne({ phone });
    if (phoneExist) {
      return res
        .status(400)
        .send({ status: false, message: "This phone number already exists" });
    }

    if (Object.keys(data).includes("password")) {
      if (!validator.isValidValue(password)) {
        return res
          .status(400)
          .send({ status: false, message: "Password can not be empty" });
      }

      if (password.length < 8 || password.length > 15) {
        return res.status(400).send({
          status: false,
          message: "password length should be between 8 to 15",
        });
      }
    password = await bcrypt.hash(password, saltRounds);
    }


    if (Object.keys(data).includes("profileImage")) {
      if (files.length==0) {
        return res.status(400).send({
          status: false,
          message: "There is no file to update",
        });
      }
    }

    let updateData = await userModel.findByIdAndUpdate({ _id: userId },data,{ new: true, upsert: true });
    
    return res.status(200).send({
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
