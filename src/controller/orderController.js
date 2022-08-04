const userModel = require('../model/userModel');
const cartModel = require('../model/cartModel');
const orderModel = require("../model/orderModel")
const validator = require("../utils/validator");

const createOrder = async  (req, res) => {
    try {
        let userId = req.params.userId;
        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "Provide a valid userId" });
        }


        let cartBody = req.body;
        let { cartId, cancellable, status } = cartBody;

        if (!validator.isValidRequest(cartBody)) {
            return res.status(400).send({ status: false, message: "Please provide body" });
        }

        if (!(validator.isValidObjectId(cartId))) {
            return res.status(400).send({ status: false, message: "Provide a valid cartId" });
        }

        if(cancellable){
            if(cancellable!==true && cancellable!==false){
                return res.status(400).send({ status: false, message: "Please provide valid cancellable status" });
            }

        }


        if(status){
        if (!validator.validStatus(status)) {
            return res.status(400).send({ status: false, message: "Please provide valid status" });
        }
    }
    else
    status= "pending"

        let findUser = await userModel.findOne({ _id: userId });

        if (!findUser)
            return res.status(404).send({ status: false, message: "User Id not found" })


        let checkCart = await cartModel.findOne({ _id: cartId })

        if (!checkCart) {
            return res.status(404).send({ status: false, message: "Cart doesn't exist" })
        }

        if (!checkCart.items.length) {
            return res.status(400).send({ status: false, message: "Please add some product in cart to make an order" });
        }

        let order = {
            userId: userId,
            items: checkCart.items,
            totalPrice: checkCart.totalPrice,
            totalItems: checkCart.totalItems,
            totalQuantity: checkCart.totalItems,
            cancellable,
            status
        }

        let createOrder = await orderModel.create(order)
        return res.status(201).send({ status: true, msg: "Order Created Successfully", data: createOrder })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId;
        const { orderId, status } = req.body;

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "Provide a valid userId" });
        }


        if (!validator.isValidRequest(req.body)) {
            return res.status(400).send({ status: false, message: "Please provide body" });
        }

        if (!(validator.isValidObjectId(orderId))) {
            return res.status(400).send({ status: false, message: "Provide a valid orderId" });
        }

        if (!validator.validStatus(status)) {
            return res.status(400).send({ status: false, message: "Please provide valid status" });
        }

        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(404).send({ status: false, message: "User Id not found" })
        }

        let findOrder = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!findOrder) {
            return res.status(404).send({ status: false, message: "order id or user id does not exist" })
        }

        let checkCancel = findOrder.cancellable
        let statusCancel = findOrder.status
        if (statusCancel == "completed" || statusCancel == "cancelled") {
            return res.status(400).send({ status: false, msg: "status cannot be changed" })
        }

        if (checkCancel) {
            let cancelOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true})
            return res.status(200).send({ status : false, data : cancelOrder})
        } else {
            return res.status(400).send({ status : false, msg : "order is not cancellable"})
        }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { createOrder, updateOrder }