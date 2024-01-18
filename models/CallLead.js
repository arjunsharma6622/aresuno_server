const mongoose = require("mongoose")

const CallLeadSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    business : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Business',
        required : true
    },
}, {
    timestamps : true
})

module.exports = mongoose.model("CallLead", CallLeadSchema)