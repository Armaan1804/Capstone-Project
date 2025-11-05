const express = require('express');
const crypto = require('crypto');
const Document = require('../models/Document');
const Page = require('../models/Page');
const Job = require('../models/Job');
const { ocrQueue } = require('../utils/simpleQueue');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const documents = await Document.find({ status: 'completed' })
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments({ status: 'completed' });

    res.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Documents list error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

router.get('/:id/pages', async (req, res) => {
  try {
    const pages = await Page.find({ 
      documentId: req.params.id,
      status: 'completed'
    }).sort({ pageNumber: 1 });

    res.json({ pages });

  } catch (error) {
    console.error('Document pages error:', error);
    res.status(500).json({ error: 'Failed to get document pages' });
  }
});

router.post('/:id/reprocess', async (req, res) => {
  try {
    const documentId = req.params.id;
    const { language = 'eng', preprocess = {} } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const jobId = crypto.randomUUID();
    
    // Create new job for reprocessing
    const job = new Job({
      jobId,
      documentId: document._id,
      status: 'waiting'
    });
    await job.save();

    // Reset document status
    document.status = 'pending';
    document.processedPages = 0;
    document.jobId = jobId;
    await document.save();

    // Clear existing pages
    await Page.deleteMany({ documentId });

    // Add reprocessing job to queue
    await ocrQueue.add('reprocess-document', {
      documentId: documentId,
      filePath: `uploads/${document.filename}`,
      jobId,
      language,
      preprocess
    });

    res.json({ 
      jobId, 
      message: 'Document reprocessing started',
      parameters: { language, preprocess }
    });

  } catch (error) {
    console.error('Reprocess error:', error);
    res.status(500).json({ error: 'Reprocessing failed' });
  }
});

module.exports = router;