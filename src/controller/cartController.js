
const cartModel = require('../model/cartModel');
const mongoose = require("mongoose");
const userModel = require('../model/userModel')
const productModel = require("../model/productModel");
const validator = require("../utils/validator");


//.................create cart................................


const createCart  = async function(req,res)  {
    try{
        let data = req.body;
        if(!validator.isValidRequest(data)) return res.status(400).send({status: false, message: "body cannot be empty"})
        
    
        if(!mongoose.isValidObjectId(req.params.userId)) return res.status(400).send({status: false, message: "Enter valid User Object Id"})
    
        let findUser = await userModel.findById({_id: req.params.userId});

        if(!findUser) return res.status(404).send({status: false, message: "User Id not found"})
       

        // if(req.params.userId!==req.userId){
        //     return res.status(403).send({
        //         status: false,
        //         message: "Unauthorized access! User's info doesn't match"})
        // }

        

        if(!Object.keys(data).includes("items"))
        return res.status(400).send({status: false, message: "No items found to add to the cart"})

        if(data.items.length<1)
        return res.status(400).send({status: false, message: "Please mention products to add to the cart"})


        if(!mongoose.isValidObjectId(data.items[0].productId)) return res.status(400).send({status: false, message: "Enter valid Product Object Id"})

        let findProduct = await productModel.findOne({_id: data.items[0].productId,isDeleted:false});

        if(!findProduct) return res.status(404).send({status: false, message: "Product Id not found"})

        if(data.items[0].quantity<1) return res.status(400).send({status: false, message: "Quantity must be greater than 0"})

        data.totalPrice = findProduct.price * data.items[0].quantity
    
        let totalItems = await cartModel.find()
        if(totalItems>0)
            data.totalItems = totalItems.length + 1
        else
            data.totalItems = 1


        let alreadyExistedUser = await cartModel.findOne({userId : req.params.userId})
        let status=false


    if(alreadyExistedUser){
        for(let i=0;i<alreadyExistedUser.items.length;i++){
            if(alreadyExistedUser.items[i].productId.toString()==data.items[0].productId){

                let totalPrice = alreadyExistedUser.totalPrice + data.totalPrice
                let quantity = alreadyExistedUser.items[0].quantity + data.items[0].quantity
                 
                let updatedData = await cartModel.findByIdAndUpdate(
                    { _id: alreadyExistedUser._id},
                    {$push:{quantity},totalPrice:totalPrice,totalItems:quantity
                },//Item quantity is left 
                    {new: true});
            
                
                status=true
                return res.status(201).send({status:false, data: updatedData}) 
            }
        }
        if(status==false){
            let totalPrice = alreadyExistedUser.totalPrice + data.totalPrice
            let count = alreadyExistedUser.items.length +1

            let newProductData = await cartModel.findOneAndUpdate({ _id: alreadyExistedUser._id},
                {$set:{totalItems: count},totalPrice,
                $push:{ items:data.items}},
                {new: true});

            return res.status(201).send({status:false, data: newProductData}) 
            }
    }
            
        
        
    

    
    
        data.userId = req.params.userId;

       let savedData = await cartModel.create(data)
       res.status(201).send({status:false, data: savedData})  
   }catch(error){
       res.status(500).send({status: false, message: error.message})                          
   }  
       
}









const getCart = async function (req, res) {
    try {
      let userId = req.params.userId;
  
      let cartDetails = await cartModel
        .findOne({ userId: userId})
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




  const deleteCart = async (req, res) => {
    try {
      let userId = req.params.userId;
  
      let deleteCart = await cartModel.findOneAndUpdate(
        { userId: userId },
        { items: [], totalPrice: 0, totalItems: 0 },
        { new: true }
      );
      return deleteCart
        ? res.status(200).send({
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


const updateCart = async (req, res) => {
  
    try {
      let userId = req.params.userId;
      const data = req.body
      if (!validator.isValidObjectId(userId)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter valid ObjectId in params" });
      }
         
          if (!validator.isValidRequest(data)) {
            return res
              .status(400)
              .send({ status: false, message: "Body can not be empty" });
          }

        let { productId, cartId, removeId } = data

        if (!validator.isValidValue(productId)) {
          return res
            .status(400)
            .send({ status: false, message: "productId must be required" });
        }
        if (!validator.isValidValue(cartId)) {
          return res
            .status(400)
            .send({ status: false, message: "cartId must be required" });
        }
        if (!validator.isValidValue(removeProduct)) {
          return res
            .status(400)
            .send({ status: false, message: "removeProduct must be required" });
        }
        if (typeof removeProduct != 'number'){
          return res
        .status(400) 
        .send({status:false, message: "removeProduct required in Number "})
        }
      if (removeProduct < 0 || removeProduct > 1){
         return res
         .status(400)
         .send({status : false, message : " removeProduct value is only 0 and 1"}) 
        }
        let updateData = await cartModel.findByIdAndUpdate(
          { _id: userId },
          { productId, cartId, removeId },
          { new: true, upsert: true }
        );
        
        return res.status(200).send({
          status: true,
          message: "cart profile updated",
          data: updateData,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, message: error.message });
      }
    };



    module.exports = {createCart, updateCart, getCart,deleteCart}
