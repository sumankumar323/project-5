const cartModel = require("../model/cartModel");
const userModel = require("../model/userModel");
const productModel = require("../model/productModel");
const validator = require("../utils/validator");



//------------------------------------------------create cart----------------------------------------------------------------



  //------------------------------------------------------------update cart----------------------------------------------------------
  
  const updateCart = async function (req, res) {
    try {
      let userId = req.params.userId;
  
      let { cartId, productId, removeProduct } = req.body;
  
      if (!productId)
        return res
          .status(400)
          .send({ status: false, message: " Please provide productId" });
  
      if (!validator.isValidObjectId(productId)) {
        return res
          .status(400)
          .send({ status: false, message: " Enter a valid productId" });
      }
  
      let product = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
      if (!product)
        return res
          .status(400)
          .send({ status: false, msg: "Product does not exist" });
  
      let cart = await cartModel.findOne({ userId: userId });
      if (!cart)
        return res
          .status(400)
          .send({ status: false, msg: "cart does not exist" });
  
      if (!removeProduct)
        return res
          .status(400)
          .send({
            status: false,
            message: " Please enter removeProduct details",
          });
  
      if (cartId) {
        if (!validator.isValidObjectId(cartId)) {
          return res
            .status(400)
            .send({ status: false, message: " Enter a valid cartId" });
        }
        if (cartId !== cart._id.toString())
          return res
            .status(400)
            .send({
              status: false,
              msg: "This cart does not belong to the user",
            });
      }
  
      let arr = cart.items;
      compareId = arr.findIndex((obj) => obj.productId == productId);
      if (compareId == -1) {
        return res
          .status(400)
          .send({
            status: false,
            msg: "The product is not available in this cart",
          });
      }
      let quantity1 = arr[compareId].quantity;
      if (removeProduct == 0) {
        arr.splice(compareId - 1, 1);
        cart.totalItems =arr.length
        cart.totalPrice -= product.price * quantity1;
        await cart.save();
        return res.status(200).send({ status: true, data: cart });
      } else if (removeProduct == 1) {
        if (arr[compareId].quantity == 1) {
          arr.splice(compareId - 1, 1);
          cart.totalItems = arr.length;
          cart.totalPrice -= product.price;
          await cart.save();
          return res.status(200).send({ status: true, data: cart });
        } else if (arr[compareId].quantity > 1) arr[compareId].quantity -= 1;
        cart.totalItems = arr.length;
        cart.totalPrice -= product.price;
        await cart.save();
        return res.status(200).send({ status: true, data: cart });
      }
    } catch (err) {
      return res.status(500).send({ status: false, error: err.message });
    }
  };
  
  //--------------------------------------------------------get cart-------------------------------------------------------------------
  
  const getCart = async function (req, res) {
    try {
      let userId = req.params.userId;
  
      let cartDetails = await cartModel
        .findOne({ userId: userId })
        .populate("items.productId");
  
      if (!cartDetails)
        return res.status(404).send({ status: false, message: "Cart not found" });
  
      return res
        .status(200)
        .send({
          status: true,
          message: "Cart details with Product details",
          data: cartDetails,
        });
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };
  
  //----------------------------------------------------delete cart-----------------------------------------------------------
  
  const deleteCart = async (req, res) => {
    try {
      let userId = req.params.userId;
  
      let deleteCart = await cartModel.findOneAndUpdate(
        { userId: userId },
        { items: [], totalPrice: 0, totalItems: 0 },
        { new: true }
      );
      return deleteCart
        ? res.status(204).send({
            status: false,
            message: "Cart Successfully Deleted",
            data: deleteCart,
          })
        : res
            .status(404)
            .send({
              status: false,
              message: "There is no cart under this user id",
            });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  
  module.exports = { createCart, getCart, updateCart, deleteCart };
