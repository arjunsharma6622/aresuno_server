// auth middleware
const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

module.exports.verification = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    console.log("Token: in auth middlware", token);
    console.log("req.baseUrl:", req.baseUrl);
    console.log(req.headers.authorization)
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        } else {
            var user;

            if (req.baseUrl.includes("business") || req.baseUrl.includes("rating")) {
                    user = await User.findById(data.id);

                    if (!user) {
                        user = await Vendor.findById(data.id);
                        console.log("data id for vendor : " + data.id)
                        console.log(user)

                    }
            }
            else if (req.baseUrl.includes("user")) {
                console.log('in the user check if block')
                user = await User.findById(data.id);
                console.log('exit the user check if block')
            } else if (req.baseUrl.includes("vendor")) {
                console.log('in the vendor check if block')
                user = await Vendor.findById(data.id);
                console.log('exit the vendor check if block')
            }
            if (!user) {
                console.log(req.baseUrl)
                return res.status(404).json({ message: "User/Vendor not found" });
            }
            req.user = user; // Set the user object in the request for use in other routes/controllers

            next();
        }
    });
};