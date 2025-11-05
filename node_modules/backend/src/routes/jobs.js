const express = require('express');
const Job = require('../models/Job');
const Document = require('../models/Document');

const router = express.Router();

router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.jobId })
      .populate('documentId');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      totalPages: job.totalPages,
      processedPages: job.processedPages,
      document: job.documentId,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error
    });

  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

module.exports = router;