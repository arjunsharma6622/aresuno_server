const express = require("express");
const router = express.Router();
const { verification, validateRole } = require("../middlewares/authorization");
const logger = require("../utils/logger");
const Package = require("../models/Package");

// retrieve all price
router.get("/getpackages", async (req, res) => {
  try {
    const packages = await Package.find();
    res.send(packages).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

