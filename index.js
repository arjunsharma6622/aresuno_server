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
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { verification } = require('./middlewares/authorization');
const jwt = require('jsonwebtoken')
const axios = require('axios');
const { json } = require('body-parser');


dotenv.config();

const db = process.env.DB_URL;
const port = process.env.PORT;
const googleMapKey = process.env.GOOGLE_MAP_KEY;
app.use(express.json());



// Configure Multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// app.use(cors({
//     origin: "*",
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Added OPTIONS method
// }));


const allowedOrigins = ["https://aresuno.com", "http://localhost:5173", "http://localhost:3000"]; // Add your actual allowed origins

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // If needed for cookies or authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));


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


// app.get('/map', async (req, res) => {
//     const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=17.367050190970474,78.52029958703778&key=")
//     const address = response.data.results[0].formatted_address
//     console.log(address)
//     console.log(response.data)
//     res.json(response.data)
// })



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
        // res.cookie('token', token, {
        //     maxAge: 24 * 60 * 60 * 1000, // 1 day
        //     sameSite: 'none',
        //     secure: true,
        //     withCredentials: true,
        //     httpOnly: false    
        // });

        

        let message;
        if (user instanceof User) {
            message = 'User logged in successfully';
        } else if (user instanceof Vendor) {
            message = 'Vendor logged in successfully';
        }

        res.status(200).json({ message: message, success: true, userType: userType, user: user, token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// getUnifiedUserData
app.get('/api/userData', verification, async (req, res) => {
    try{
        let user = await User.findById(req.user._id);
        let userType = "user"
        if(!user){
            user = await Vendor.findById(req.user._id);
            userType = "vendor"
        }
        res.status(200).json({user: user, userType: userType})
    }
    catch(error){
        res.status(500).send(error)
    }
})

app.use('/api/logout', (req, res) => {
    res.clearCookie('token', {
        sameSite: 'none',
        secure: true
    });
    res.status(200).end();
});

app.post('/api/tokenexpired', verification, (req, res) => {
    res.status(200).end()
})


app.get('/api/getLocationFromLatLong', async (req, res) => {
    const lat = req.query.lat
    const long = req.query.long
    
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${googleMapKey}`)
    const location = response.data.results[0].formatted_address
    console.log(response.data.results)
    console.log(location)
    res.json(location)
})




app.get('/api/autocomplete', async (req, res) => {
    const input = req.query.input; // Get the input query parameter from the request
    console.log(input)
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${googleMapKey}&types=(regions)`;
  
    try {
      const response = await axios.get(url);
      const predictions = response.data.predictions;
  
      if (predictions && predictions.length > 0) {
        const placeId = predictions[0].place_id; // Get the place ID from the first prediction
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleMapKey}`;
  
        const detailsResponse = await axios.get(detailsUrl);
        const { address_components } = detailsResponse.data.result;
  
        // Extract required details (state, country, pin number, district, etc.)
        const extractedDetails = {
          state: address_components.find(component => component.types.includes('administrative_area_level_1'))?.long_name || '',
          country: address_components.find(component => component.types.includes('country'))?.long_name || '',
          postalCode: address_components.find(component => component.types.includes('postal_code'))?.long_name || '',
          city: address_components.find(component => component.types.includes('locality'))?.long_name || '',
          street: address_components.find(component => component.types.includes('route'))?.long_name || '',
          building: address_components.find(component => component.types.includes('subpremise'))?.long_name || '',
          pinNumber: address_components.find(component => component.types.includes('postal_code_suffix'))?.long_name || '',
          placeId: placeId


          // Add more details as needed
        };
  
        res.status(200).send(extractedDetails);
      } else {
        res.status(404).send({ message: 'No predictions found' });
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  });



// Import routes
app.use('/api/business', require('./routes/Business'));
app.use('/api/user', require('./routes/User'));
app.use('/api/vendor', require('./routes/Vendor'));
app.use('/api/post', require('./routes/Post'));
app.use('/api/banner', require('./routes/Banner'));
app.use('/api/category', require('./routes/Category'));
app.use('/api/rating', require('./routes/Rating'))



// Return "https" URLs by setting secure: true
cloudinary.config({
    secure: true
  });
  


module.exports = app