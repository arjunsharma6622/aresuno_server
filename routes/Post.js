const express = require("express")
const router = express.Router()
const Post = require("../models/Post")
const { verification } = require("../middlewares/authorization")
const Business = require("../models/Business")



router.post("/create", async (req, res, next) => {
    try {
        const { businessId, image, description } = req.body;
        const post = new Post({ businessId, image, description });
        await post.save();

        const busiess = await Business.findById(businessId);
        busiess.posts.push(post._id);
        await busiess.save();
        
        res.status(201).send(post);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get("/all-posts", async (req, res, next) => {
    try {
        const posts = await Post.find()
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get("/all-posts/:id", async (req, res, next) => {
    try {
        const posts = await Post.find({ businessId: req.params.id })
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).send(post);
    } catch (error) {
        res.status(500).send(error);
    }
})





module.exports = router;