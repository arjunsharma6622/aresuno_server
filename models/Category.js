const mongoose = require('mongoose');


const CategorySchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    image : {
        url : {
            type : String,
            required : true
        },
        altTag : {
            type : String,
            required : true
        }

    }
}, {
    timestamps : true
})

module.exports = mongoose.model('Category', CategorySchema)