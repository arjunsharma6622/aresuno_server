const mongoose = require("mongoose")

const EnquirySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    message : {
        type : String,
        required : true
    },
    business : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Business',
        required : true
    },
    category : {
        type : String,
    },
    location : {
        type : String
    },
    status : {
        type : String,
        enum : ['pending', 'resolved', 'rejected'],
    }
}, {
    timestamps : true
})


module.exports = mongoose.model('Enquiry', EnquirySchema)