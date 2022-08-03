
const cartModel = require('../model/cartModel');
const userModel = require('../model/userModel')
const productModel = require("../model/productModel");
const validator = require("../utils/validator");


//.................create cart................................


const createCart  = async function(req,res)  {
    try{
        
        let { quantity, productId } = req.body;
        const userId = req.params.userId

        if(!validator.isValidRequest(req.body)) return res.status(400).send({status: false, message: "body cannot be empty"})
        
    
        if(!validator.isValidObjectId(userId)) return res.status(400).send({status: false, message: "Enter valid User Object Id"})
    
        let findUser = await userModel.findById({_id: userId});

        if(!findUser) return res.status(404).send({status: false, message: "User Id not found"})

        if(!validator.isValidObjectId(productId) || !validator.isValidValue(productId)) return res.status(400).send({status: false, message: "Enter valid Product Object Id"})
       
        if (!quantity) {
          quantity = 1
      }
        if (quantity<1) {
          return res.status(400).send({ status: false, message: "Please must be greater than zero." })
      }


      //cartModel.fDetailsyId(cartId).populate([{ path: "items.productId" }])


        // if(userId!==req.userId){
        //     return res.status(403).send({
        //         status: false,
        //         message: "Unauthorized access! User's info doesn't match"})
        // }
        

        let findProduct = await productModel.findOne({_id: productId,isDeleted:false});

        if(!findProduct) return res.status(404).send({status: false, message: "Product Id not found"})

        let findCartOfUser = await cartModel.findOne({userId})

        if (!findCartOfUser) {

          //destructuring for the response body.
          var cartData = {
              userId: userId,
              items: [{
                  productId: productId,
                  quantity: quantity,
              }],
              totalPrice: findProduct.price * quantity,
              totalItems: 1
          }
        
          const createCart = await cartModel.create(cartData)
          return res.status(201).send({ status: true, message: `Cart created successfully`, data: createCart })
        }


          if (findCartOfUser) {

            //updating price when products get added or removed.
            let price = findCartOfUser.totalPrice + (quantity * findProduct.price)
            let itemsArr = findCartOfUser.items

            //updating quantity.
            for (i in itemsArr) {
                if (itemsArr[i].productId.toString() === productId) {
                    itemsArr[i].quantity += Number(quantity)

                    let updatedCart = { items: itemsArr, totalPrice: price, totalItems: itemsArr.length }

                    let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })

                    return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData })
                }
            }
            itemsArr.push({ productId: productId, quantity: quantity }) //storing the updated prices and quantity to the newly created array.

            let updatedCart = { items: itemsArr, totalPrice: price, totalItems: itemsArr.length }
            let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })

            return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData })
        }

   }catch(error){
       res.status(500).send({status: false, message: error.message})                          
   }  
       
}





const updateCart = async (req, res) => {
  try {

      const userId = req.params.userId
      let { productId, cartId, removeProduct } = req.body



      if (!cartId) {
          return res.status(400).send({ status: false, message: "cartId be must present..." })
      }
      if (!validator.isValidObjectId(cartId)) {
        return res.status(400).send({ status: false, message: "Not a valid cartId" })
    }

      if (!productId) {
          return res.status(400).send({ status: false, message: "productId must be present..." })
      }
      if (!validator.isValidObjectId(productId)) {
        return res.status(400).send({ status: false, message: "Not a valid ProductId" })
    }

      if (!removeProduct && removeProduct != 0 ) {
          return res.status(400).send({ status: false, message: "removeProduct key must be present..." })
      }
      if (!(removeProduct == "1" || removeProduct == "0")) {
          return res.status(400).send({ status: false, message: "removeProduct must be either 0 or 1" })
      }



      const cartDetails = await cartModel.findById({ _id: cartId })
     
      if (!cartDetails) {
          return res.status(404).send({ status: false, message: "cartId does'nt exist" })
      }

      const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })

      if (!productDetails) {
          return res.status(404).send({ status: false, message: "productId doesn't exist" })
      }

      const productIdInCart = await cartModel.findOne({ userId: userId, "items.productId": productId })

      if (!productIdInCart) {
          return res.status(404).send({ status: false, message: "productId does'nt exist in this cart" })
      }


      let { items } = cartDetails
      let getPrice = productDetails.price

      for (let i = 0; i < items.length; i++) {
          if (items[i].productId == productId) {

              let totelProductprice = items[i].quantity * getPrice

              if (removeProduct == 0 || (items[i].quantity == 1 && removeProduct == 1)) {

                  const removeCart = await cartModel.findOneAndUpdate({ userId: userId },
                      {
                          $pull: { items: { productId: productId } },
                          $inc: {
                              totalPrice: - totelProductprice,
                              totalItems: - 1
                          }
                      },
                      { new: true })

                  return res.status(200).send({ status: true, message: 'sucessfully removed product from cart', data: removeCart })

              }

              const product = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.$.quantity": -1, totalPrice: -getPrice } }, { new: true })

              return res.status(200).send({ status: true, message: 'sucessfully decrease one quantity of product', data: product })
          }
      }
  } catch (error) {
      return res.status(500).send({ status: false, error: error.message })
  }
}














const getCart = async function (req, res) {
    try {
      let userId = req.params.userId;
  
      let cartDetails = await cartModel
        .findOne({ userId})
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




/*
const updateCart = async (req, res) => {
  
    try {
      let userId = req.params.userId;
      const data = req.body
    
      if (!validator.isValidRequest(data)) {
        return res
          .status(400)
          .send({ status: false, message: "Body can not be empty" });
      }

      let { productId, cartId, removeProduct } = data


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
      // if (!validator.isValidValue(removeId)) {
      //   return res
      //     .status(400)
      //     .send({ status: false, message: "removeProduct must be required" });
      // }



      if (!validator.isValidObjectId(userId)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter valid User ObjectId in params" });
      }

      if (!validator.isValidObjectId(productId)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter valid Product ObjectId in request body" });
      }
      if (!validator.isValidObjectId(cartId)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter valid Cart ObjectId in request body" });
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



        let productData = await productModel.findOne({ _id: productId ,isDeleted:false})
        if(!productData) 
          return res
          .status(404)
          .send({status : false, message : "Product Id not Found"}) 


        let cartData = await cartModel.findOne({ _id: cartId })
        if(!cartData) 
          return res
          .status(404)
          .send({status : false, message : "Cart Id not Found"}) 



         if(cartData){
          for(let i=0; i<cartData.items.length;i++){

            if(cartData.items[i].productId.toString()==productId){
              let totelProductprice = cartData.items[i].quantity * productData.price
              if(removeProduct==1){
            cartData = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.$.quantity": -1, totalPrice: -productData.price } }, { new: true })
            return res.status(200).send({
              status: true,
              message: "cart profile updated",
              data: cartData,
             });
            }


            if (removeProduct == 0 || (items[i].quantity == 1 && removeProduct == 1)) {

              const removeCart = await cartModel.findOneAndUpdate({ userId},
                  {
                      $pull: { items: { productId: productId } },
                      $inc: {
                          totalPrice: - totalP,
                          totalItems: - 1
                      }
                  },
                  { new: true })

              return res.status(200).send({ status: true, message: 'sucessfully removed product from cart', data: removeCart })

          }
            }
          }


    
          
         
         }
        } catch (error) {
          
          res.status(500).send({ status: false, message: error.message });
        }
      };
  */
  
  
      module.exports = {createCart, updateCart, getCart,deleteCart}



<<<<<<< HEAD

//    if(removeProduct==="0"){
//     let updatedCart=await cartModel.findOneAndUpdate({_id:cartId},{items:[]},{new:true})
// if(!(cart.totalItems>0))return res.status(400).send({ status: false, message: " No items to delete" })
//        let updatedCart=await cartModel.findOneAndUpdate({_id:cartId},{items:{productId:productId,$inc:{quantity:-1}
//     }},{new:true})
   
=======
>>>>>>> 3f2afc3879ad4942d20af93fc370147f5c811866
