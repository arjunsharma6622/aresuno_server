const express = require('express');
const router = express.Router();
const Category = require('../models/Category');


router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.send(categories).status(200);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/add', async (req, res) => {
    try {
        const newCategories = await Category.insertMany(req.body);
        res.status(201).send(newCategories);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});


router.delete("/:id", async (req, res) => {
    try{
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        res.send(deletedCategory).status(200);
    }
    catch(err){
        res.status(500).send(err);
    }
})








module.exports = router