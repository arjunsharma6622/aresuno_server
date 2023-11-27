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
