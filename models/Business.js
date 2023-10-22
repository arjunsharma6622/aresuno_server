const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['service', 'manufacturing'],
        required: true
    },
    profileImg: {
        type: String,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    description: String,
    website: String,
    email: String,
    mainCategory: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    address: {
        place: {
            type: String,
        },
        pincode: {
            type: String,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    phone: {
        type: String,
        required: true
    },
    timing: {
        type: String,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    photosGallery: [String],
    modeOfPayment: [String],
    ratingsReviews: [{
        rating: {
            type: Number,
        },
        review: {
            type: String,
        }
    }],
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String
    },
    faqs: [{
        question: {
            type: String,
        },
        answer: {
            type: String,
        }
    }]
}, {
    timestamps: true // adds createdAt and updatedAt fields
});




BusinessSchema.pre('save', async function (next) {
    try {
      const business = this;
      const existingBusiness = await mongoose.model('Business').findOne({ name: business.name });
  
      if (existingBusiness) {
        const err = new Error('Business with this name already exists');
        err.status = 409; // conflict status code
        return next(err);
      }
  
      next();
    } catch (error) {
      next(error);
    }
  });


  
module.exports = mongoose.model('Business', BusinessSchema);
