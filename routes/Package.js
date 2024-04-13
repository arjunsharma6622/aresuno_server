const express = require("express");
const router = express.Router();
const { verification, validateRole } = require("../middlewares/authorization");
const logger = require("../utils/logger");
const Package = require("../models/Package");
const PackageBenefits = require("../models/PackageBenefits");

// retrieve all price
router.get("/getpackages", async (req, res) => {
  try {
    const packages = await Package.find();
    res.send(packages).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

// update package and its properties
router.post(
  "/update",
  verification,
  validateRole(["admin"]),
  async (req, res) => {
    try {
      const updatePackage = await Package.findOneAndUpdate(
        {
          _id: req.body._id,
        },
        req.body,
      );
      res.status(200).send(updatePackage);
    } catch (error) {
      logger.error(error);
      res.status(400).send(error);
    }
  },
);

// post router to create new packages
router.post(
  "/create",
  verification,
  validateRole(["admin"]),
  async (req, res) => {
    try {
      const createdPackages = await Package.insertMany(req.body);
      res.status(201).json(createdPackages);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Failed to create categories" });
    }
  },
);

// create new package benefit
router.post(
  "/benefits/create",
  verification,
  validateRole(["admin"]),
  async (req, res) => {
    try {
      const data = await PackageBenefits.insertMany(req.body);
      res.status(201).json(data);
    } catch (error) {
      logger.error(error);
      res.status(500).json({
        error: `Failed to create new package benefits due to following error: ${error}`,
      });
    }
  },
);

router.post(
  "/benefits/update",
  verification,
  validateRole(["admin"]),
  async (req, res) => {
    try {
      const data = await PackageBenefits.findByIdAndUpdate(
        { _id: req.body._id },
        req.body,
      );
      res.status(203).json(data);
    } catch (error) {
      logger.error(error);
      res.status(500).json({
        error: `Failed to update package benefits due to following error: ${error}`,
      });
    }
  },
);

// fetch all benefits
router.get("/benefits/fetchAll", async (req, res) => {
  try {
    const data = await PackageBenefits.find();
    res.status(200).json(data);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: `Failed to retrieve all package benefits due to following error: ${error}`,
    });
  }
});

// delete a specific benefit
router.delete(
  "/benefits/delete",
  verification,
  validateRole(["admin"]),
  async (req, res) => {
    try {
      const data = await PackageBenefits.findOneAndDelete({
        _id: req.body._id,
      });
      res.status(202).json(data);
    } catch (error) {
      logger.error(error);
      res.status(500).json({
        error: `Failed to delete benefit due to following error: ${error}`,
      });
    }
  },
);

module.exports = router;
