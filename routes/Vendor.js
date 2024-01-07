const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const bcrypt = require('bcrypt');
const { createSecretToken } = require('../utils/SecretToken');
const { vendorVerification, verification } = require('../middlewares/authorization');
const User = require('../models/User');
const Business = require('../models/Business');


// CREATE
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, gender, businesses, image } = req.body;

        // Check if the email already exists in either Vendor or User collections
        const vendorExists = await Vendor.findOne({ email: email });
        const userExists = await User.findOne({ email: email });

        if (vendorExists || userExists) {
            return res.status(400).send({ message: 'Email already in use for registration.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const vendor = new Vendor({ name, email, password: hashedPassword, phone, gender, businesses, image });

        await vendor.save();

        const token = createSecretToken(vendor._id);
        console.log(token);
        
        res.cookie('token', token, {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'none',
            secure: true,  
            withCredentials: true,
            httpOnly: false          
        });

        res.status(201).send({ vendor: vendor, token: token });
    } catch (error) {
        console.log('Error occurred:', error);
        res.status(400).send(error);
    }
});





// READ ALL
router.get('/all-vendors', async (req, res) => {
    try {
        const vendors = await Vendor.find();
        res.send(vendors);
    } catch (error) {
        res.status(500).send(error);
    }
});


// router.get("/businesses", verification, async (req, res, next) => {
//     try {
//         const businesses = await Business.find({ vendorId: req.user._id }).populate("posts").populate("ratings")
//         res.status(201).send(businesses);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// })



router.get("/businesses", verification, async (req, res, next) => {
    try {
        const businesses = await Business.find({ vendorId: req.user._id })
            .populate("posts")
            .populate({
                path: "ratings",
                populate: {
                    path: "userId",
                    model: "User",
                },
            });

        res.status(201).send(businesses);
    } catch (error) {
        res.status(500).send(error);
    }
});

  

// READ ONE
router.get('/',verification, async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.user._id);
        if (!vendor) {
            return res.status(404).send();
        }
        res.send(vendor);
    } catch (error) {
        res.status(500).send(error);
    }
});

// UPDATE
router.patch('/', verification, async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'image'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const vendor = await Vendor.findById(req.user._id);
        if (!vendor) {
            return res.status(404).send();
        }

        if (req.body.password) {
            console.log(req.body.password)
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            vendor.password = hashedPassword;
        }


        updates.forEach((update) => {
            if (update !== 'password') {
                vendor[update] = req.body[update];
            }
        });

        await vendor.save();
        res.send(vendor);
    } catch (error) {
        res.status(400).send(error);
    }
});

//DELETE
router.delete('/:id', async (req, res, next) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) {
            return res.status(404).send({ error: "Vendor not found" });
        }
        res.status(200).send({ message: "Vendor deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;