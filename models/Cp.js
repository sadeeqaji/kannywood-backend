//user registration Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CpSchema = new Schema({
    providerName: {
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

    Subscription: {
        type: Boolean,
        default: false
    },
    isCp: {
      type: Boolean,
      default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
});

module.exports = Cp = mongoose.model('cp', CpSchema)
