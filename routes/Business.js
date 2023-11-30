const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const Vendor = require("../models/Vendor");
const { verification } = require("../middlewares/authorization");
const { ObjectId } = require("mongodb");
const Category = require("../models/Category");

// CREATE
router.post("/register", async (req, res) => {
  try {
    const newBusiness = new Business(req.body);
    const mainCategoryId = req.body.mainCategory;
    const subCategoryId = req.body.subCategory;

    console.log(newBusiness);
    await newBusiness.save();



    // updating vendor with the newly registered businesses
    const vendorId = newBusiness.vendorId;
    await Vendor.updateOne(
      { _id: vendorId },
      { $push: { businesses: newBusiness._id } }
    );



    // updating categories with the newly registered businesses
    const category = await Category.findById(mainCategoryId);
    const updatedSubcategories = category.subcategories.map((subcategory) =>
      subcategory._id.toString() === subCategoryId
        ? {
            ...subcategory,
            businesses: [...subcategory.businesses, newBusiness._id],
          }
        : subcategory
    );

    await Category.updateOne(
      { _id: mainCategoryId },
      { $set: { subcategories: updatedSubcategories } }
    )

    res.status(201).send(newBusiness);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const businesses = await Business.find({});
    res.send(businesses);
  } catch (error) {
    res.status(500).send(error);
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate("posts");
    if (!business) {
      return res.status(404).send("Business not found");
    }
    res.send(business);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body; // Assuming the updates are sent in the request body

    console.log(req.body);

    // Use the findByIdAndUpdate method to update the business record
    const updatedBusiness = await Business.findByIdAndUpdate(id, updates, {
      new: true,
    });

    // Check if the business record with the given id exists
    if (!updatedBusiness) {
      return res.status(404).send("Business not found");
    }

    console.log(updatedBusiness);
    res.status(200).send("Business updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/:id/rating", verification, async (req, res, next) => {
  const { rating, review } = req.body;
  const ratingReview = {
    user: { name: req.user.name },
    rating,
    review,
  };

  console.log(ratingReview);

  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).send();
    }
    business.ratingsReviews.push(ratingReview);
    await business.save();
    console.log("check the push one");

    res.send(business);
  } catch (error) {
    res.status(400).json({ message: "error in rating and review", error });
  }
});

// DELETE
router.delete("/:id", verification, async (req, res, next) => {
  try {
    console.log("The business id to be deleted is" + req.params.id);
    const business = await Business.findByIdAndDelete(req.params.id);

    await Vendor.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { businesses: new ObjectId(req.params.id) } }
    );
    const updatedVendor = await Vendor.findById(req.user._id);

    console.log("The updated Venodr is : " + updatedVendor);

    if (!business) {
      return res.status(404).send("Business not found");
    }
    res.send("Business deleted");
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/getbusinessesbycategory/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const businesses = await Business.find({ subCategory: categoryId });
    res.status(202).send(businesses);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
