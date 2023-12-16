// const express = require('express');
// const router = express.Router();
// const Category = require('../models/Category');


// router.get('/', async (req, res) => {
//     try {
//         const categories = await Category.find();
//         res.send(categories).status(200);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// })

// router.post('/add', async (req, res) => {
//     try {
//         const newCategories = await Category.insertMany(req.body);
//         res.status(201).send(newCategories);
//     } catch (error) {
//         console.log(error);
//         res.status(400).send(error);
//     }
// });


// router.delete("/:id", async (req, res) => {
//     try{
//         const deletedCategory = await Category.findByIdAndDelete(req.params.id);
//         res.send(deletedCategory).status(200);
//     }
//     catch(err){
//         res.status(500).send(err);
//     }
// })








// module.exports = router






const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).send(categories);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Add new category
router.post('/add', async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).send(savedCategory);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});


// Add new subcategories to categories
router.post('/addsubcategories', async (req, res) => {
    try {
      const subcategoriesData = req.body;
  
      if (!subcategoriesData || !Array.isArray(subcategoriesData)) {
        return res.status(400).send({ message: 'Invalid request body' });
      }
  
      const categoryIds = subcategoriesData.map((subcategory) => subcategory.categoryId);
  
      const categories = await Category.find({ _id: { $in: categoryIds } });
  

      subcategoriesData.forEach((subcategory) => {
        const category = categories.find((cat) => cat._id.toString() === subcategory.categoryId);
        if (category) {
          category.subcategories.push({
            name: subcategory.name,
            image: {
              url: subcategory.image.url,
              altTag: subcategory.image.altTag,
            },
          });
        }
      });
  
      const savedCategories = await Promise.all(categories.map((category) => category.save()));
  
      res.status(201).send(savedCategories);
    } catch (error) {
      console.error(error);
      res.status(400).send(error);
    }
  });


  //update main category title
  router.put("/:id", async (req, res) => {
    try{
      const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).send(updatedCategory);
    }
    catch(err){
      res.status(500).send(err);
    }
  })

  //update subcategory
  router.put("/updatesubcategory/:categoryId/:subcategoryId", async (req, res) => {
    try{
      const category = await Category.findById(req.params.categoryId);
      if(!category){
        return res.status(404).send({ message: 'Category not found' });
      }

      const subcategoryId = req.params.subcategoryId;
      const updatedSubcategory = {
        name: req.body.name,
        image: {
          url: req.body.image.url,
          altTag: req.body.image.altTag,
        },
        icon : req.body.icon
      }

      const updatedSubcategories = category.subcategories.map(subcategory => {
        if(subcategory._id.toString() === subcategoryId){
          return updatedSubcategory;
        }
        return subcategory;
      });
      category.subcategories = updatedSubcategories;
      const savedCategory = await category.save();
      res.status(200).send(savedCategory);

    }
    catch(err){
      res.status(500).send(err);
    }
  })
 

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).send({ message: 'Category not found' });
    }
    res.status(200).send(deletedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Delete subcategory from a category
router.delete("/deletesubcategory/:categoryId/:subcategoryId", async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).send({ message: 'Category not found' });
    }

    const subcategoryId = req.params.subcategoryId;
    const updatedSubcategories = category.subcategories.filter(subcategory => subcategory._id != subcategoryId);
    category.subcategories = updatedSubcategories;

    const savedCategory = await category.save();
    res.status(200).send("Subcategory deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
