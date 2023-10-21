const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { createSecretToken } = require('../utils/SecretToken');
const { verification } = require('../middlewares/authorization');

// CREATE
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, gender, place } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        const user = new User({ name, email, password: hashedPassword, phone, gender, place });

        await user.save();


        const token = createSecretToken(user._id);
        console.log(token);
         
        res.cookie('token', token, {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'none',
            secure: true,    
            withCredentials: true,
            httpOnly: false            
        });
        

        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
})

// router.post('/login', async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'Incorrect email or password' });
//         }
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             return res.status(400).json({ message: 'Incorrect email or password' });
//         }
//         const token = createSecretToken(user._id);
//         console.log(token);
//         res.cookie("token", token, {
//             httpOnly: false,
//             maxAge: 24 * 60 * 60 * 1000, // 1 day
//             sameSite: 'none',
//             secure: true
//         });
//         res.status(200).json({ message: "User logged in successfully", success: true });
//         next()
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// READ ALL
router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// READ ONE
router.get('/', verification, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// UPDATE
router.patch('/', verification, async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'place', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send();
        }


        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            user.password = hashedPassword;
        }

        updates.forEach((update) => {
            if (update !== 'password') {
                user[update] = req.body[update];
            }
        });

        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});


//DELETE
router.delete('/',verification, async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
