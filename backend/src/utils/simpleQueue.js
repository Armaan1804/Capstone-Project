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
      let fileContent = '';
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const path = require('path');
        const ext = path.extname(filePath).toLowerCase();
        
        if (ext === '.pdf') {
          // Parse PDF
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(fileBuffer);
          fileContent = pdfData.text;
          console.log('Extracted PDF text, pages:', pdfData.numpages);
        } else {
          // For text files, convert to string
          fileContent = fileBuffer.toString('utf8');
        }
        
        // If content is empty, use sample text
        if (!fileContent || fileContent.trim().length === 0) {
          fileContent = 'Sample OCR text for demonstration. This text is searchable.';
        }
      } catch (err) {
        console.log('Could not read file:', err.message);
        fileContent = 'Sample OCR text for demonstration. This text is searchable.';
      }
      
      // Create a page with actual file content
      console.log('File content length:', fileContent.length);
      console.log('File content preview:', fileContent.substring(0, 200));
      
      const page = new Page({
        documentId,
        pageNumber: 1,
        text: fileContent,
        confidence: 95,
        status: 'completed',
        processedAt: new Date()
      });
      await page.save();
      console.log('Page saved with text length:', page.text.length);

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