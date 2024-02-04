const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index : true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        index : true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    place: {
        type: String,
    },
    image : {
        type: String
    },
    otp : {
        value : {
            type: String
        },
        expires : {
            type: Date
        },
        createdAt : {
            type: Date
        }
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
