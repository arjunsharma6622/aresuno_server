// const mongoose = require('mongoose');


// const CategorySchema = new mongoose.Schema({
//     title : {
//         type : String,
//         required : true
//     },
//     name : {
//         type : String,
//         required : true
//     },
//     image : {
//         url : {
//             type : String,
//             required : true
//         },
//         altTag : {
//             type : String,
//             required : true
//         }

//     }
// }, {
//     timestamps : true
// })

// module.exports = mongoose.model('Category', CategorySchema)



const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      required: true,
    },
    altTag: {
      type: String,
      required: true,
    },
  },
  icon: {
    type: String,
    required: true,
  },
  businesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
  }]
});

const CategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subcategories: [SubcategorySchema], // Array of subcategories
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', CategorySchema);
