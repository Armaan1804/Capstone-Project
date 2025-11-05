const express = require('express');
const Page = require('../models/Page');
const { ocrQueue } = require('../utils/simpleQueue');

const router = express.Router();

router.post('/:id/reprocess', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id).populate('documentId');
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Add reprocessing job to queue
    await ocrQueue.add('reprocess-page', {
      pageId: page._id.toString(),
      documentId: page.documentId._id.toString(),
      pageNumber: page.pageNumber
    });

    page.status = 'pending';
    await page.save();

    res.json({ message: 'Page reprocessing queued' });

  } catch (error) {
    console.error('Reprocess error:', error);
    res.status(500).json({ error: 'Failed to queue reprocessing' });
  }
});

router.put('/:id/correct', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    page.text = text;
    page.confidence = 100; // Manual correction has 100% confidence
    await page.save();

    res.json({ message: 'Page text corrected successfully' });

  } catch (error) {
    console.error('Correction error:', error);
    res.status(500).json({ error: 'Failed to correct page text' });
  }
});

module.exports = router;