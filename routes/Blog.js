const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');


router.get('/', async (req, res) => {
    try {
        const blog = await Blog.find({});
        res.send(blog).status(200);
    } catch (error) {
        res.status(500).send(error);
    }
})

//create a blog
router.post('/create', async (req, res) => {
    try {
        const newBlog = new Blog(req.body);
        console.log(newBlog);
        await newBlog.save();
        res.status(201).send(newBlog);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});


router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body; // Assuming the updates are sent in the request body

        console.log(req.body);

        // Use the findByIdAndUpdate method to update the business record
        const updatedBlog = await Blog.findByIdAndUpdate(id, updates, {
            new: true,
        });

        // Check if the business record with the given id exists
        if (!updatedBlog) {
            return res.status(404).send("Blog not found");
        }

        console.log(updatedBlog);
        res.status(200).send("Blog updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Use the findByIdAndDelete method to delete the business record
        const deletedBlog = await Blog.findByIdAndDelete(id);

        // Check if the business record with the given id exists
        if (!deletedBlog) {
            return res.status(404).send("Blog not found");
        }

        console.log(deletedBlog);
        res.status(200).send("Blog deleted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})


module.exports = router