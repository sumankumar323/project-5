const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User_Project5',
        required: true,
        unique: true
    },
    items: [{
        productId: { type: ObjectId,
             required: true,
              ref:'Product' ,
            },
              
        quantity: { type: Number, required: true, minLen: 1 },
        _id: false
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    }
}, 
{ timestamps: true })

module.exports = mongoose.model('Cart', cartSchema)