const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// Create a lead
router.post('/', async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all leads
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lead scores
router.get('/scores', async (req, res) => {
  try {
    const { id, sort, minScore, maxScore } = req.query;

    // Handle specific lead retrieval by ID
    if (id) {
      const lead = await Lead.findById(id).select('name score');
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found.' });
      }
      return res.status(200).json({ lead });
    }

    // Build a query for filtering
    const query = {};
    if (minScore) query.score = { $gte: Number(minScore) };
    if (maxScore) query.score = { ...query.score, $lte: Number(maxScore) };

    // Fetch all leads
    let leads = await Lead.find(query).select('name score');

    // Apply sorting
    if (sort === 'asc') {
      leads = leads.sort((a, b) => a.score - b.score);
    } else if (sort === 'desc') {
      leads = leads.sort((a, b) => b.score - a.score);
    }

    return res.status(200).json({ leads });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while retrieving lead scores.' });
  }
});

// Get a lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a lead
router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.status(200).json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit inquiry and update lead score
router.post('/:id/inquiry', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Validate request body
    if (!message) {
      return res.status(400).json({ error: 'Inquiry message is required.' });
    }

    // Find the lead by ID
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    // Add the inquiry to the lead
    lead.inquiries.push({ message });

    // Update the lead's score (e.g., increment by 10 points per inquiry)
    lead.score += 10;

    // Save the updated lead
    await lead.save();

    // Return the updated score
    res.status(200).json({ message: 'Inquiry submitted.', score: lead.score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while submitting the inquiry.' });
  }
});

module.exports = router;
