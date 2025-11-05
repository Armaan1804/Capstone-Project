require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const io = require('socket.io-client');

const Document = require('../../backend/src/models/Document');
const Page = require('../../backend/src/models/Page');
const Job = require('../../backend/src/models/Job');

const PDFProcessor = require('./processors/pdfProcessor');
const OCRProcessor = require('./processors/ocrProcessor');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/document-search');

// Connect to backend for real-time updates
const socket = io(process.env.BACKEND_URL || 'http://localhost:3000');

const worker = new Worker('ocr-processing', async (job) => {
  const { documentId, filePath, jobId, language = 'eng', preprocess = {} } = job.data;
  
  try {
    console.log(`Processing job ${jobId} for document ${documentId}`);
    
    // Update job status
    await Job.findOneAndUpdate(
      { jobId },
      { status: 'active' }
    );

    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    document.status = 'processing';
    await document.save();

    let imagePaths = [];
    let totalPages = 0;

    // Process based on file type
    if (document.mimeType === 'application/pdf') {
      // Convert PDF to images
      const outputDir = path.join(path.dirname(filePath), 'pages');
      imagePaths = await PDFProcessor.convertToImages(filePath, outputDir);
      totalPages = imagePaths.length;
    } else {
      // Single image file
      imagePaths = [filePath];
      totalPages = 1;
    }

    // Update document and job with total pages
    document.totalPages = totalPages;
    await document.save();

    await Job.findOneAndUpdate(
      { jobId },
      { totalPages }
    );

    // Process each page
    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      const pageNumber = i + 1;

      try {
        // Create page record
        const page = new Page({
          documentId: document._id,
          pageNumber,
          status: 'processing',
          imagePath
        });
        await page.save();

        // OCR processing with custom parameters
        const ocrResult = await OCRProcessor.processPage(imagePath, pageNumber, {
          language,
          preprocess: {
            binarize: preprocess.binarize !== false,
            threshold: preprocess.threshold || 128,
            ...preprocess
          }
        });

        // Update page with OCR results
        page.text = ocrResult.text;
        page.confidence = ocrResult.confidence;
        page.textBlocks = ocrResult.textBlocks;
        page.status = 'completed';
        page.processedAt = new Date();
        await page.save();

        // Update progress
        const processedPages = i + 1;
        const progress = Math.round((processedPages / totalPages) * 100);

        await Job.findOneAndUpdate(
          { jobId },
          { 
            processedPages,
            progress
          }
        );

        document.processedPages = processedPages;
        await document.save();

        // Emit progress update
        socket.emit('job-progress', {
          jobId,
          progress,
          processedPages,
          totalPages,
          currentPage: pageNumber
        });

        console.log(`Completed page ${pageNumber}/${totalPages} for job ${jobId}`);

      } catch (pageError) {
        console.error(`Error processing page ${pageNumber}:`, pageError);
        
        // Mark page as failed
        await Page.findOneAndUpdate(
          { documentId: document._id, pageNumber },
          { 
            status: 'failed',
            error: pageError.message
          }
        );
      }
    }

    // Mark document and job as completed
    document.status = 'completed';
    document.processedAt = new Date();
    await document.save();

    await Job.findOneAndUpdate(
      { jobId },
      { 
        status: 'completed',
        completedAt: new Date()
      }
    );

    // Emit completion
    socket.emit('job-completed', { jobId });

    console.log(`Job ${jobId} completed successfully`);

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);

    // Mark as failed
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      error: error.message
    });

    await Job.findOneAndUpdate(
      { jobId },
      { 
        status: 'failed',
        error: error.message
      }
    );

    // Emit failure
    socket.emit('job-failed', { jobId, error: error.message });

    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  concurrency: 2
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

console.log('OCR Worker started');

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  process.exit(0);
});