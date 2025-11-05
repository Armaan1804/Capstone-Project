// Simple in-memory queue for demo without Redis
class SimpleQueue {
  constructor() {
    this.jobs = new Map();
    this.processing = false;
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  async add(name, data) {
    const jobId = data.jobId;
    this.jobs.set(jobId, { name, data, status: 'waiting' });
    
    // Process immediately for demo
    setTimeout(() => this.processJob(jobId), 100);
    
    return { id: jobId };
  }

  async processJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'active';
    
    try {
      // Read actual file content
      const fs = require('fs');
      const Document = require('../models/Document');
      const Page = require('../models/Page');
      const Job = require('../models/Job');

      const { documentId, filePath } = job.data;
      
      // Update job status
      await Job.findOneAndUpdate({ jobId }, { status: 'active' });
      
      // Read file content
      let fileContent = 'Sample OCR text for demonstration. This text is searchable.';
      try {
        fileContent = fs.readFileSync(filePath, 'utf8');
      } catch (err) {
        console.log('Could not read file, using default content');
      }
      
      // Create a page with actual file content
      const page = new Page({
        documentId,
        pageNumber: 1,
        text: fileContent,
        confidence: 95,
        status: 'completed',
        processedAt: new Date()
      });
      await page.save();

      // Update document
      await Document.findByIdAndUpdate(documentId, {
        status: 'completed',
        totalPages: 1,
        processedPages: 1,
        processedAt: new Date()
      });

      // Update job
      await Job.findOneAndUpdate({ jobId }, {
        status: 'completed',
        progress: 100,
        totalPages: 1,
        processedPages: 1,
        completedAt: new Date()
      });

      job.status = 'completed';
      console.log(`Job ${jobId} completed`);
      
      // Emit WebSocket event
      if (this.io) {
        this.io.to(`job-${jobId}`).emit('job-completed', { jobId });
      }

    } catch (error) {
      job.status = 'failed';
      console.error(`Job ${jobId} failed:`, error);
      
      // Emit WebSocket event
      if (this.io) {
        this.io.to(`job-${jobId}`).emit('job-failed', { jobId });
      }
    }
  }
}

const simpleQueue = new SimpleQueue();
module.exports = { ocrQueue: simpleQueue };