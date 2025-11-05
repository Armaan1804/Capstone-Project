const express = require('express');
const crypto = require('crypto');
const upload = require('../middleware/upload');
const { generateFileHash } = require('../utils/fileHash');
const { ocrQueue } = require('../utils/simpleQueue');
const Document = require('../models/Document');
const Job = require('../models/Job');

const router = express.Router();

router.post('/', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileHash = await generateFileHash(req.file.path);
    
    // Check for duplicate
    const existingDoc = await Document.findOne({ fileHash });
    if (existingDoc) {
      return res.json({ 
        jobId: existingDoc.jobId, 
        documentId: existingDoc._id,
        message: 'Document already exists' 
      });
    }

    const jobId = crypto.randomUUID();
    
    // Create document record
    const document = new Document({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileHash,
      mimeType: req.file.mimetype,
      size: req.file.size,
      jobId
    });
    
    await document.save();

    // Create job record
    const job = new Job({
      jobId,
      documentId: document._id
    });
    
    await job.save();

    // Add to processing queue
    await ocrQueue.add('process-document', {
      documentId: document._id.toString(),
      filePath: req.file.path,
      jobId
    });

    res.json({ 
      jobId, 
      documentId: document._id,
      message: 'Document uploaded successfully' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;