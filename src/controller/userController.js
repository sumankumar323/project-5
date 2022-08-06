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

    // VALIDATIONS STARTS
    if (!validator.isValidRequest(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Body can not be empty" });
    }

    let { fname, lname, email, profileImage, phone, password, address } = data;

    if (!validator.isValidValue(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "Fname is required" });
    }

    if (!validator.isValidName(fname)) {
      return res.status(400).send({
        status: false,
        message:
          "Fname may contain only letters. Digits & Spaces are not allowed ",
      });
    }

    if (!validator.isValidValue(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "Lname is required" });
    }

    if (!validator.isValidName(lname)) {
      return res.status(400).send({
        status: false,
        message:
          "Lname may contain only letters. Digits & Spaces are not allowed",
      });
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
    if (!data.address || !isNaN(data.address)) {
      return res
        .status(400)
        .send({ status: false, message: "Valid address is required" });
    }
    address = JSON.parse(data.address);

    if (!address.shipping || !address.billing) {
      return res.status(400).send({
        status: false,
        message: "shipping and billing address required",
      });
    }

    if (!address.shipping.street || !address.billing.street) {
      return res
        .status(400)
        .send({ status: false, message: "street is  required " });
    }
    if (!address.shipping.city || !address.billing.city) {
      return res
        .status(400)
        .send({ status: false, message: "city is  required" });
    }
    if (!address.shipping.pincode || !address.billing.pincode) {
      return res
        .status(400)
        .send({ status: false, message: "pincode is  required " });
    }

    let Sstreet = address.shipping.street;
    let Scity = address.shipping.city;
    let Spincode = parseInt(address.shipping.pincode); //shipping
    if (Sstreet) {
      let validateStreet = /^[a-zA-Z0-9]/;
      if (!validateStreet.test(Sstreet)) {
        return res.status(400).send({
          status: false,
          message: "enter valid street name in shipping",
        });
      }
    }

    if (Scity) {
      let validateCity = /^[a-zA-Z0-9]/;
      if (!validateCity.test(Scity)) {
        return res.status(400).send({
          status: false,
          message: "enter valid city name in shipping",
        });
      }
    }
    if (Spincode) {
      let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/; //must not start with 0,6 digits and space(optional)
      if (!validatePincode.test(Spincode)) {
        return res
          .status(400)
          .send({ status: false, message: "enter valid pincode in shipping" });
      }
    }

    let Bstreet = address.billing.street;
    let Bcity = address.billing.city;
    let Bpincode = parseInt(address.billing.pincode); //billing
    if (Bstreet) {
      let validateStreet = /^[a-zA-Z0-9]/;
      if (!validateStreet.test(Bstreet)) {
        return res.status(400).send({
          status: false,
          message: "enter valid street name in shipping",
        });
      }
    }

    if (Bcity) {
      let validateCity = /^[a-zA-Z0-9]/;
      if (!validateCity.test(Bcity)) {
        return res.status(400).send({
          status: false,
          message: "enter valid city name in shipping",
        });
      }
    }
    if (Bpincode) {
      let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/; //must not start with 0,6 digits and space(optional)
      if (!validatePincode.test(Bpincode)) {
        return res
          .status(400)
          .send({ status: false, message: "enter valid pincode in shipping" });
      }
    }

    data.address = address;

    //validation ends
    
    
    if (files.length > 0) {
      if (!validator.validFormat(files[0].originalname)) {
        return res
        .status(400)
        .send({ status: false, message: "only image format is accept" });
      }
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
    if (err instanceof SyntaxError) {
      return res
        .status(400)
        .send({ status: false, message: "Address should be in Object format" });
    } else {
      return res
        .status(500)
        .send({ status: false, message: "Error occcured : " + err });
    }
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

    let checkemail = await userModel.findOne({ email: email });

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

    //GENERATE TOKEN

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
    console.log(profile);

    if (!profile)
      return res.status(404).send({
        status: false,
        message: "User Id doesn't exist.Please enter another Id",
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

const updateUser = async (req, res) => {
  try {
    let userId = req.params.userId;

    if (!validator.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Enter valid ObjectId in params" });



    const updatedData = await userModel.findOne({ _id: userId });

    if (!updatedData)
      return res.status(404).send({
        status: false,
        message: "User Id doesn't exist.Please enter another Id",
      });

    let data = req.body;
let files=req.files;
    if (!validator.isValidRequest(data) && !files) {
      return res
        .status(400)
        .send({ status: false, message: "Nothing to update" });
    }

    let { fname, lname, email, phone, password, address } = data;
    
   // let files = req.files;
    if (files && files.length > 0) {
      let uploadFileUrl = await aws_config.uploadFile(files[0]);
      updatedData.profileImage = uploadFileUrl;
    }  
    if (fname) {
      if (!validator.isValidValue(fname)) {
        return res
          .status(400)
          .send({ status: false, message: "Fname can not be empty" });
      }
      if (!validator.isValidName(fname)) {
        return res.status(400).send({
          status: false,
          message:
            "Fname may contain only letters. Digits & Spaces are not allowed",
        });
      }
      updatedData.fname = fname;
    }

    if (lname) {
      if (!validator.isValidValue(lname)) {
        return res
          .status(400)
          .send({ status: false, message: "Lname can not be empty" });
      }
      if (!validator.isValidName(lname)) {
        return res.status(400).send({
          status: false,
          message:
            "Lname may contain only letters. Digits & Spaces are not allowed",
        });
      }
      updatedData.lname = lname;
    }

    if (email) {
      if (!validator.isValidEmail(email)) {
        return res.status(400).send({
          status: false,
          message: "Entered email is invalid or empty",
        });
      }
      let emailExist = await userModel.findOne({ email });
      if (emailExist) {
        return res
          .status(400)
          .send({ status: false, message: "This email already exists" });
      }
      updatedData.email = email;
    }

    if (phone) {
      if (!validator.isValidPhone(phone)) {
        return res.status(400).send({
          status: false,
          message: "Entered phone number is invalid or empty",
        });
      }
      let phoneExist = await userModel.findOne({ phone });
      if (phoneExist) {
        return res
          .status(400)
          .send({ status: false, message: "This phone number already exists" });
      }

      updatedData.phone = phone;
    }

    if (password) {
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
      updatedData.password = password;
    }
/*
     if (typeof address !== "object") {
       return res.status(400).send({
         status: false,
         message: "address should be a  valid object",
       });
     }
 
    if (address) {
      let addr = JSON.parse(address);
      if (addr.shipping) {
        let { street, city, pincode } = addr.shipping;

        if (street) {
          if(!validator.isValidValue(street))
            return res.status(400).send({status:false,message:"Invalid shipping street"})
          updatedData.address.shipping.street = street
        }

        if (city) {
          if(!validator.isValidValue(city))
            return res.status(400).send({status:false,message:"Invalid shipping city"})
          updatedData.address.shipping.city = city
        }

        if (pincode) {
          if(!validator.isValidValue(pincode))
            return res.status(400).send({status:false,message:"Invalid shipping street"})
          updatedData.address.shipping.pincode = pincode
        }
      }
    }
    */
    if ("address" in data) {
      if (typeof address === "string") 
        return res
          .status(400)
          .send({ status: false, message: "Address should be an Object" });
      if (typeof address === "object") {
        if (!("shipping" in address) && !("billing" in address))
          return res.status(400).send({
            status: false,
            message: "Pls Provide Atleast Billing And Shipping to update",
          });
        let { shipping, billing } = data.address;
        if ("shipping" in address) {
          if (typeof shipping === "string")
            return res
              .status(400)
              .send({ status: false, message: "Shipping should be an Object" });
          if (typeof data.address.shipping === "object") {
            if (
              !("street" in shipping) &&
              !("city" in shipping) &&
              !("pincode" in shipping)
            )
              return res.status(400).send({
                status: false,
                message:
                  "Pls Provide Anyone ('STREET','CITY','PINCODE') in Shipping to update",
              });
            let { street, city, pincode } = data.address.shipping;
            if ("street" in shipping) {
              if (!validator.isValidValue(street))
                return res.status(400).send({
                  status: false,
                  message: "Street Should Not Be empty",
                });
                updatedData.address.shipping.street = street
                .split(" ")
                .filter((e) => e)
                .join(" ");
            }
            if ("city" in shipping) {
              if (!validator.isValidValue(city))
                return res
                  .status(400)
                  .send({ status: false, message: "City Should not be empty" });
              if (!validator.isValidName(city))
                return res.status(400).send({
                  status: false,
                  message: "Pls Enter Valid city name",
                });
                updatedData.address.shipping.city = city;
            }
            if ("pincode" in shipping) {
              if (!validator.isValidValue(pincode))
                return res.status(400).send({
                  status: false,
                  message: "Pincode should not be empty",
                });
              if(!validator.isValidPincode(pincode))
                return res.status(400).send({
                  status: false,
                  message: "Enter a valid Indian Pincode",
                });
                updatedData.address.shipping.pincode = pincode;
            }
          }
        }
        if ("billing" in address) {
          if (typeof data.address.billing === "string")
            return res
              .status(400)
              .send({ status: false, message: "Billing Should be an object" });
          if (typeof data.address.billing === "object") {
            if (
              !("street" in billing) &&
              !("city" in billing) &&
              !("pincode" in billing)
            )
              return res.status(400).send({
                status: false,
                message:
                  "Pls Provide Anyone ('STREET','CITY','PINCODE') in Billing to update",
              });
            const { street, city, pincode } = data.address.billing;
            if ("street" in billing) {
              if (!validator.isValidValue(street))
                return res.status(400).send({
                  status: false,
                  message: "Street in Billing Should Not Be empty",
                });
                updatedData.address.billing.street = street
                .split(" ")
                .filter((e) => e)
                .join(" ");
            }
            if ("city" in billing) {
              if (!validator.isValidValue(city))
                return res.status(400).send({
                  status: false,
                  message: "City in Billing Should not be empty ",
                });
              if (!validator.isValidName(city))
                return res.status(400).send({
                  status: false,
                  message: "Pls Enter Valid city name in Billing",
                });
                updatedData.address.billing.city = city;
            }
            if ("pincode" in billing) {
              if (!validator.isValidValue(pincode))
                return res.status(400).send({
                  status: false,
                  message: "Pincode in Billing should not be empty",
                });
              if (!validator.isValidPincode(pincode))
                return res.status(400).send({
                  status: false,
                  message: "Enter Pan Pincode in Billing",
                });
                updatedData.address.billing.pincode = pincode;
            }
          }
        }
      }
    }
 
    updatedData.save()
    return res.status(200).send({
      status: true,
      message: "User profile updated",
      data: updatedData,
    });
  } 
catch (error) {
 // console.log(error)
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { registerUser, login, getUserDetails, updateUser };
