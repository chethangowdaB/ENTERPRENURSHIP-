const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },                
  usercart: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    image: String,
    productDescription: { type: String, required: true },
    rate: { type: Number, required: true },
    category: { type: String }
  }],
  ratedProducts: [{
    productId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String
  }]
});


const Product = new mongoose.Schema({
  name: { type: String, required: true },
  items: [{
    productId: { type: Number, required: true },
    productName: { type: String, required: true },
    productImageLinks: [String], 
    productDescription: { type: String, required: true },
    rate: { type: Number, required: true },
    category: { type: String,},
    mcategory: { type: String,},
    ratings: [
      {
        userId: String,
        rating: Number,
        comment: String,
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 }
      }
    ],
    averageRating: Number,

  }],
  
  
});
const gstSchema = new mongoose.Schema({
  gstNumber: String,
  name: String,
  address: String,
 
});
const Gst =mongoose.model('GST',gstSchema);
const User = mongoose.model('Login', userSchema);
const Products= mongoose.model('Product', Product);
module.exports = {User, Products,Gst};
