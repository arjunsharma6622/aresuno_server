const express = require('express');
const router = express.Router();
const CategoryTitle = require('../models/CategoryTitle');

router.post('/create', async (req, res) => {
    try{
        const newCategoryTitle = new CategoryTitle(req.body);
        const savedCategoryTitle = await newCategoryTitle.save();
        res.status(201).send(savedCategoryTitle);
    }
    catch(err){
        res.status(500).send(err);
    }
})

router.get('/', async (req, res) => {
    try{
        const categoryTitles = await CategoryTitle.find();
        res.status(201).send(categoryTitles);
    }
    catch(err){
        res.status(500).send(err);
    }
})

router.put('/:id', async (req, res) => {
    try{
        const categoryTitle = await CategoryTitle.findByIdAndUpdate(req.params.id, req.body);
        res.status(201).send(categoryTitle);
    }
    catch(err){
        res.status(500).send(err);
    }
})



module.exports = router