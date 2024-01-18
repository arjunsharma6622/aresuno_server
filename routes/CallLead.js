const express = require('express');
const router = express.Router();
const CallLead = require('../models/CallLead');
const Business = require('../models/Business');


router.post('/create', async (req, res) => {
    try {
        const newCallLead = new CallLead(req.body);
        await newCallLead.save();
        const business = await Business.findById(req.body.business);
        business.callLeads.push(newCallLead._id);
        await business.save();
        res.status(200).send(newCallLead);
    }
    catch(err) {
        res.status(500).send(err);
    }
})

//get all call leads
router.get('/', async (req, res) => {
    try {
        const leads = await CallLead.find();
        res.status(200).send(leads);
    }
    catch(err) {
        res.status(500).send(err);
    }
})

//get call lead by id
router.get('/:id', async (req, res) => {
    try {
        const lead = await CallLead.findById(req.params.id);
        res.status(200).send(lead);
    }
    catch(err) {
        res.status(500).send(err);
    }
})

//delete call lead
router.delete('/:id', async (req, res) => {
    try {
        const lead = await CallLead.findByIdAndDelete(req.params.id);
        res.status(200).send(lead);
    }
    catch(err) {
        res.status(500).send(err);
    }
})


module.exports = router