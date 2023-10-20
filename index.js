const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const { createSecretToken } = require('./utils/SecretToken');
const app = express();
const bcrypt = require('bcrypt');

dotenv.config();

const db = process.env.DB_URL;
const port = process.env.PORT;
app.use(express.json());


app.use(cors({
    origin: ['http://localhost:5173', 'https://aresuno.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],

}))
app.use(cookieParser());

// ss

// Connect to MongoDB database
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


// Start server
app.listen(port, () => {
    console.log('Server started on port ' + port);
});

// Define routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});


// Unified Login Endpoint
app.post('/api/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        let userType = "user"
        if (!user) {
            user = await Vendor.findOne({ email });
            userType = "vendor"
        }

        if (!user) {
            return res.status(400).json({ message: 'Incorrect email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Incorrect email or password' });
        }

        const token = createSecretToken(user._id);
        console.log(token);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'none',
            secure: true
        });

        let message;
        if (user instanceof User) {
            message = 'User logged in successfully';
        } else if (user instanceof Vendor) {
            message = 'Vendor logged in successfully';
        }

        res.status(200).json({ message : message, success: true, userType: userType, user: user });
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/api/logout', (req, res) => {
    res.clearCookie('token', { path: '/' }).send('Cookie cleared');
  });
  

// Import routes
app.use('/api/business', require('./routes/Business'));
app.use('/api/user', require('./routes/User'));
app.use('/api/vendor', require('./routes/Vendor'));




module.exports = app