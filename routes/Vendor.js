const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const bcrypt = require('bcrypt');
const { createSecretToken } = require('../utils/SecretToken');
const { vendorVerification } = require('../middlewares/authorization');


// CREATE
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, gender, businesses } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        

        const vendor = new Vendor({ name, email, password: hashedPassword, phone, gender, businesses });


        await vendor.save();
        res.status(201).send(vendor);
    } catch (error) {
        console.log('eerrr')
        res.status(400).send(error);
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(400).json({ message: 'Incorrect email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, vendor.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Incorrect email or password' });
        }
        const token = createSecretToken(vendor._id);
        console.log(token);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.status(200).json({ message: "Vendor logged in successfully", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
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

// READ ONE
router.get('/',vendorVerification, async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.vendor._id);
        if (!vendor) {
            return res.status(404).send();
        }
        res.send(vendor);
    } catch (error) {
        res.status(500).send(error);
    }
});

// UPDATE
router.patch('/', vendorVerification, async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const vendor = await Vendor.findById(req.vendor._id);
        if (!vendor) {
            return res.status(404).send();
        }

        if (req.body.password) {
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
router.delete('/', vendorVerification, async (req, res, next) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.vendor._id);
        if (!vendor) {
            return res.status(404).send({ error: "Vendor not found" });
        }
        res.status(200).send({ message: "Vendor deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;