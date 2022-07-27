const mongoose = require("mongoose");
const aws_config = require("../utils/aws-config");
const validator = require("../utils/validator");
const productModel = require("../model/productModel");


/**********************************************GET PRODUCT BY ID API*******************************************/

const createProduct = async (req, res) => {
  try {
    let files = req.files;
    let data = req.body;

    if (!validator.isValidRequest(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Body can not be empty" });
    }
    let {title,description,price,currencyId,currencyFormat,productImage,availableSizes  } = data;
    if (!validator.isValidValue(title)) {
      return res
        .status(400)
        .send({ status: false, message: "title is required" });
    }
    const isDuplicate = await productModel.find({ title: title });
    if (isDuplicate.length == 0) {
      data.title = title;
    } else {
      return res.status(400).send({
        status: false,
        message: "This title is already present ",
      });
    }
  
  
    if(!validator.isValidValue(description)) {
      return res
        .status(400)
        .send({ status: false, message: "description is required" });
    }
    if (!validator.isValidValue(price)) {
      return res
        .status(400)
        .send({ status: false, message: "price is required" });
    }
    if (!validator.isValidValue(currencyId)) {
      return res
        .status(400)
        .send({ status: false, message: "currencyId is required" });
    }
    if (!validator.isValidValue(currencyFormat)) {
      return res
        .status(400)
        .send({ status: false, message: "currencyFormat is required" });
    }
    console.log(productImage)
     if(Object.keys(data).includes(productImage)) {
      return res
        .status(400)
        .send({ status: false, message: "ProductImage is required" });
    }

    if (files.length > 0) {
      data.productImage = await aws_config.uploadFile(files[0]);
    } else {
      return res
        .status(400)
        .send({ status: false, message: "ProductImage File is required" });
    }
    if (!validator.isValidValue(availableSizes)) {
      return res
        .status(400)
        .send({ status: false, message: "availableSizes is required" });
     }
  if (!["S", "XS","M","X", "L","XXL", "XL"].includes(availableSizes)) 
     { return res.status(400)
       .send({ status: false, message: 'title must be "S", "XS","M","X", "L","XXL", "XL" ' }) }

    let savedData = await productModel.create(data);
  return res
    .status(201)
    .send({ status: true, message: "Data created", Data: savedData });
}
 catch (err) {
  return res
    .status(500)
    .send({ status: false, message: "Error occcured : " + err });
}
};



/**********************************************GET PRODUCT BY ID API*******************************************/

const getProductById = async (req, res) => {
  try {
    let productId = req.params.productId

    if (!validator.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, msg: "productId invalid" })
    }

    let productData = await productModel.findOne({ _id: productId })

    if (!productData) {
      return res.status(404).send({ status: false, message: "No product found " })
    }

    return res.status(200).send({ status: true, message: "Product details", data: productData })
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}


/**********************************************GET PRODUCT BY FILTERS API*******************************************/

const getProductsByFilters = async (req, res) => {
  try {
    let data = req.query;
    const { size, name, priceGreaterThan, priceLessThan, priceSort } = data;
    const filterData = { isDeleted: false };
    let priceSortValue = 1;

    if (data.hasOwnProperty("size")) {
      if (!validator.isValidValue(size)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid size" });
      } else {
        filterData.availableSizes = size;
      }
    }

    if (data.hasOwnProperty("name")) {
      if (!validator.isValidValue(name)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid name" });
      } else {
        filterData.title = name;
      }
    }

    if (data.hasOwnProperty("priceGreaterThan")) {
      if (Number(priceGreaterThan) == NaN) {
        return res
          .status(400)
          .send({
            status: false,
            message: "priceGreaterThan should be a valid Number ",
          });
      }

      if (priceGreaterThan <= 0) {
        return res
          .status(400)
          .send({
            status: false,
            message: "priceGreaterThan should be a greater than Zero ",
          });
      }
      if (!filterData.hasOwnProperty("price")) {
        filterData["price"] = {};
      }
      filterData["price"]["$gte"] = Number(priceGreaterThan);
    }

    if (data.hasOwnProperty("priceLessThan")) {
      if (Number(priceLessThan) == NaN) {
        return res
          .status(400)
          .send({
            status: false,
            message: "priceLessThan should be a valid Number ",
          });
      }

      if (priceLessThan <= 0) {
        return res
          .status(400)
          .send({
            status: false,
            message: "priceLessThan should be a greater than Zero ",
          });
      }

      if (!filterData.hasOwnProperty("price")) {
        filterData["price"] = {};
      }
      filterData["price"]["$lte"] = Number(priceLessThan);
    }

    if (data.hasOwnProperty("priceSort")) {
      if (!(priceSort == 1 || priceSort == -1)) {
        return res
          .status(400)
          .send({ status: false, message: `priceSort should be 1 or -1 ` });
      }
    }

    console.log(filterData);

    let findData = await productModel
      .find(filterData)
      .sort({ price: priceSort });

      if (findData.length === 0) {
        return res.status(404).send({ status: false, message: 'No Product found' })
    }

    res.status(200).send({ status: true, Data: findData });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};


/**********************************************UPDATE PRODUCT API*******************************************/

const productUpdation = async (req, res) => {
  try {
      let productId = req.params.productId

      if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "write valid ObjectId in params" });

      let data = req.body;
      let files = req.files;

      let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSize, installments} = data

      

      if (!validator.isValidRequest(data) && !req.files) {
        return res
          .status(400)
          .send({ status: false, message: "Specify Parameters to Update" });
      }
  
      if (Object.keys(data).includes("productImage")) {
        if (files.length==0) {
          return res.status(400).send({
            status: false,
            message: "There is no file to update",
          });
        }
      }

      if (Object.keys(data).includes("title")) {
        if (!validator.isValidValue(title)) {
          return res
            .status(400)
            .send({ status: false, message: "title can not be empty" });
        }
      }
  
      if (files.length > 0) {
          productImage = await aws_config.uploadFile(files[0]);
      } 
     

      let updateData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false },
          { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSize, installments }, { new: true});

      if (!updateData) return res.status(404).send({ status: false, msg: "product not found" })

      return res.status(200).send({ status: true, message: "product is updated", data: updateData });
  } catch (error) {
      console.log(error);
      res.status(500).send({ status: false, message: error.message });
  }
}


/**********************************************DELETE PRODUCT API*******************************************/

const deleteByProductId = async function (req, res) {
  try {
      let productId = req.params.productId;
      if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: " write valid ObjectId" });

      let deleteProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: Date.now() } });
      if (!deleteProduct) return res.status(400).send({ status: false, message: "productId not found" });

      res.status(200).send({ status: true, message: "document is deleted" })
  } catch (error) {
      console.log(error);
      res.status(500).send({ status: false, msg: error.message });
  }
}



module.exports = {createProduct, getProductsByFilters, getProductById, productUpdation, deleteByProductId};
