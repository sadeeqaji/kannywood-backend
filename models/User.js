//user registration Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber:{
      type: String,
      required: true
    },
    DateRegistered: {
        type: Date,
        default: Date.now
    },
    IsVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isCp:{
      type: Boolean,
      default: false
    },
    Subscription: {
        type: Boolean,
        default: false
    },
    isUser: {
      type: Boolean,
      default: true
    }
});

module.exports = User = mongoose.model('users', UserSchema)
