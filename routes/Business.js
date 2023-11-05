const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Vendor = require('../models/Vendor');
const { verification } = require('../middlewares/authorization');
const { ObjectId } = require('mongodb');

// CREATE
router.post('/register', async (req, res) => {
    try {
        const newBusiness = new Business(req.body);
        console.log(newBusiness);
        await newBusiness.save();
        const vendorId = newBusiness.vendorId;
        await Vendor.updateOne({ _id: vendorId }, { $push: { businesses: newBusiness._id } });
        res.status(201).send(newBusiness);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// READ ALL
router.get('/', async (req, res) => {
    try {
        const businesses = await Business.find({});
        res.send(businesses);
    } catch (error) {
        res.status(500).send(error);
    }
});


// READ ONE
router.get('/:id', async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).send("Business not found");
        }
        res.send(business);
    } catch (error) {
        res.status(500).send(error);
    }
});

// UPDATE
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'type', 'profileImg', 'mainCategory', 'subCategory', 'timing', 'phone', 'photosGallery', 'socialLinks', 'faqs', 'address', 'modeOfPayment'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).send();
        }
        updates.forEach((update) => (business[update] = req.body[update]));
        await business.save();
        res.send(business);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.patch('/:id/rating', verification, async (req, res, next) => {
    const { rating, review } = req.body;
    try {
        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).send();
        }
        business.ratingsReviews.push({ userId : req.user._id, rating, review });
        await business.save();
        res.send(business);
    } catch (error) {
        res.status(400).send(error);
    }
})

// DELETE
router.delete('/:id', verification, async (req, res, next) => {
    try {
        console.log('The business id to be deleted is' + req.params.id);
        const business = await Business.findByIdAndDelete(req.params.id);

        await Vendor.findOneAndUpdate({ _id : req.user._id }, { $pull: {businesses : new ObjectId(req.params.id)} });
        const updatedVendor = await Vendor.findById(req.user._id);

        console.log('The updated Venodr is : ' + updatedVendor);
        
        if (!business) {
            return res.status(404).send("Business not found");
        }
        res.send("Business deleted");
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
