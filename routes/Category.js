const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const cloudinary = require('cloudinary').v2;

router.get("/", async (req, res) => {
  try{
    const categories = await Category.find();
    res.status(200).send(categories);
  }
  catch(err){
    res.status(500).send(err);
  }
})

router.put("/:id", async (req, res) => {
  try{
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send(updatedCategory);
  }
  catch(err){
    res.status(500).send(err);
  }
})


// POST route to create one or more categories
router.post('/create', async (req, res) => {
  try {
    const categoriesData = req.body; // Assuming req.body contains an array of category objects

    // Create multiple categories at once using insertMany
    const createdCategories = await Category.insertMany(categoriesData);

    res.status(201).json(createdCategories); // Return the created categories
  } catch (error) {
    console.error('Error creating categories:', error);
    res.status(500).json({ error: 'Failed to create categories' });
  }
});

// delete category
router.delete("/:id", async (req, res) => {
  try{
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    res.status(200).send(deletedCategory);
  }
  catch(err){
    res.status(500).send(err);
  }
})

module.exports = router;
