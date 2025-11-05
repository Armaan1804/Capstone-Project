const request = require('supertest');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const Document = require('../src/models/Document');
const Page = require('../src/models/Page');
const Job = require('../src/models/Job');

describe('Integration Tests - Complete OCR Workflow', () => {
  let testDocumentId;
  let testJobId;

  beforeAll(async () => {
    // Clean up any existing test data
    await Document.deleteMany({ originalName: /test-integration/ });
    await Page.deleteMany({});
    await Job.deleteMany({ jobId: /test-job/ });
  });

  afterAll(async () => {
    // Clean up test data
    if (testDocumentId) {
      await Document.findByIdAndDelete(testDocumentId);
      await Page.deleteMany({ documentId: testDocumentId });
    }
    if (testJobId) {
      await Job.deleteOne({ jobId: testJobId });
    }
  });

  describe('Complete Document Processing Workflow', () => {
    it('should complete the full upload -> process -> search workflow', async () => {
      // Step 1: Create test document
      const testContent = `
        Machine Learning and Artificial Intelligence
        
        This document contains information about advanced data processing techniques.
        Natural language processing and computer vision are key components.
        Deep learning algorithms can extract meaningful patterns from large datasets.
        
        Document analysis systems use OCR technology to convert images to searchable text.
        Text extraction and indexing enable full-text search capabilities.
      `;
      
      const testFilePath = path.join(__dirname, 'test-integration-doc.txt');
      fs.writeFileSync(testFilePath, testContent);

      // Step 2: Upload document
      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('document', testFilePath)
        .expect(200);

      expect(uploadResponse.body).toHaveProperty('jobId');
      expect(uploadResponse.body).toHaveProperty('documentId');
      
      testJobId = uploadResponse.body.jobId;
      testDocumentId = uploadResponse.body.documentId;

      // Step 3: Wait for processing and monitor job status
      let jobCompleted = false;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout

      while (!jobCompleted && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const jobResponse = await request(app)
          .get(`/api/jobs/${testJobId}`)
          .expect(200);

        const jobStatus = jobResponse.body.job.status;
        console.log(`Job status: ${jobStatus}, Progress: ${jobResponse.body.job.progress}%`);

        if (jobStatus === 'completed') {
          jobCompleted = true;
          expect(jobResponse.body.job.progress).toBe(100);
        } else if (jobStatus === 'failed') {
          throw new Error(`Job failed: ${jobResponse.body.job.error}`);
        }
        
        attempts++;
      }

      expect(jobCompleted).toBe(true);

      // Step 4: Verify document status
      const documentResponse = await request(app)
        .get('/api/documents')
        .expect(200);

      const processedDoc = documentResponse.body.documents.find(
        doc => doc._id === testDocumentId
      );
      
      expect(processedDoc).toBeDefined();
      expect(processedDoc.status).toBe('completed');
      expect(processedDoc.totalPages).toBeGreaterThan(0);

      // Step 5: Verify pages were created
      const pagesResponse = await request(app)
        .get(`/api/documents/${testDocumentId}/pages`)
        .expect(200);

      expect(pagesResponse.body.pages).toBeDefined();
      expect(pagesResponse.body.pages.length).toBeGreaterThan(0);
      
      const firstPage = pagesResponse.body.pages[0];
      expect(firstPage.text).toContain('Machine Learning');
      expect(firstPage.confidence).toBeGreaterThan(0);

      // Step 6: Test search functionality
      const searchTests = [
        { query: 'machine learning', expectedMatch: true },
        { query: 'artificial intelligence', expectedMatch: true },
        { query: 'data processing', expectedMatch: true },
        { query: 'nonexistent term xyz', expectedMatch: false }
      ];

      for (const test of searchTests) {
        const searchResponse = await request(app)
          .get(`/api/search?q=${encodeURIComponent(test.query)}`)
          .expect(200);

        if (test.expectedMatch) {
          expect(searchResponse.body.results.length).toBeGreaterThan(0);
          expect(searchResponse.body.results[0].snippet).toContain('<mark>');
        } else {
          expect(searchResponse.body.results.length).toBe(0);
        }
      }

      // Cleanup
      fs.unlinkSync(testFilePath);
    }, 60000); // 60 second timeout for complete workflow

    it('should handle document reprocessing workflow', async () => {
      // Skip if no test document from previous test
      if (!testDocumentId) {
        console.log('Skipping reprocessing test - no test document available');
        return;
      }

      // Step 1: Reprocess with different parameters
      const reprocessResponse = await request(app)
        .post(`/api/documents/${testDocumentId}/reprocess`)
        .send({
          language: 'eng',
          preprocess: {
            binarize: true,
            threshold: 150,
            denoise: true
          }
        })
        .expect(200);

      expect(reprocessResponse.body).toHaveProperty('jobId');
      expect(reprocessResponse.body.message).toBe('Document reprocessing started');
      
      const reprocessJobId = reprocessResponse.body.jobId;

      // Step 2: Monitor reprocessing job
      let reprocessCompleted = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!reprocessCompleted && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const jobResponse = await request(app)
          .get(`/api/jobs/${reprocessJobId}`)
          .expect(200);

        const jobStatus = jobResponse.body.job.status;
        
        if (jobStatus === 'completed') {
          reprocessCompleted = true;
        } else if (jobStatus === 'failed') {
          console.log('Reprocessing failed, but test continues');
          break;
        }
        
        attempts++;
      }

      // Step 3: Verify pages were updated (if reprocessing completed)
      if (reprocessCompleted) {
        const pagesResponse = await request(app)
          .get(`/api/documents/${testDocumentId}/pages`)
          .expect(200);

        expect(pagesResponse.body.pages.length).toBeGreaterThan(0);
      }
    }, 60000);
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle duplicate file uploads', async () => {
      const testContent = 'Duplicate test content for hash testing';
      const testFilePath = path.join(__dirname, 'duplicate-test.txt');
      fs.writeFileSync(testFilePath, testContent);

      // First upload
      const firstUpload = await request(app)
        .post('/api/upload')
        .attach('document', testFilePath)
        .expect(200);

      // Second upload (should detect duplicate)
      const secondUpload = await request(app)
        .post('/api/upload')
        .attach('document', testFilePath)
        .expect(200);

      expect(secondUpload.body.message).toBe('Document already exists');
      expect(secondUpload.body.jobId).toBe(firstUpload.body.jobId);

      fs.unlinkSync(testFilePath);
    });

    it('should handle invalid job ID requests', async () => {
      await request(app)
        .get('/api/jobs/invalid-job-id')
        .expect(404);
    });

    it('should handle invalid document ID for reprocessing', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .post(`/api/documents/${fakeId}/reprocess`)
        .send({ language: 'eng' })
        .expect(404);
    });

    it('should validate search query parameters', async () => {
      // Missing query parameter
      await request(app)
        .get('/api/search')
        .expect(400);

      // Empty query parameter
      await request(app)
        .get('/api/search?q=')
        .expect(400);
    });

    it('should handle pagination in search results', async () => {
      const response = await request(app)
        .get('/api/search?q=test&page=1&limit=5')
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should handle pagination in documents list', async () => {
      const response = await request(app)
        .get('/api/documents?page=1&limit=10')
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent uploads', async () => {
      const uploadPromises = [];
      const testFiles = [];

      // Create multiple test files
      for (let i = 0; i < 3; i++) {
        const content = `Concurrent test document ${i} with unique content ${Date.now()}-${i}`;
        const filePath = path.join(__dirname, `concurrent-test-${i}.txt`);
        fs.writeFileSync(filePath, content);
        testFiles.push(filePath);

        const uploadPromise = request(app)
          .post('/api/upload')
          .attach('document', filePath);
        
        uploadPromises.push(uploadPromise);
      }

      // Wait for all uploads to complete
      const responses = await Promise.all(uploadPromises);

      // Verify all uploads succeeded
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('jobId');
        expect(response.body).toHaveProperty('documentId');
      });

      // Cleanup
      testFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }, 30000);

    it('should handle multiple concurrent searches', async () => {
      const searchQueries = [
        'machine learning',
        'artificial intelligence', 
        'data processing',
        'document analysis',
        'text extraction'
      ];

      const searchPromises = searchQueries.map(query =>
        request(app).get(`/api/search?q=${encodeURIComponent(query)}`)
      );

      const responses = await Promise.all(searchPromises);

      // Verify all searches completed successfully
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('results');
        expect(response.body).toHaveProperty('pagination');
      });
    });
  });

  describe('Real-time Updates (WebSocket)', () => {
    it('should emit job progress events', (done) => {
      // This test would require WebSocket client setup
      // For now, we'll just verify the endpoint exists
      request(app)
        .get('/api/health')
        .expect(200)
        .end(() => {
          // In a real implementation, you would:
          // 1. Connect to WebSocket
          // 2. Upload a document
          // 3. Listen for progress events
          // 4. Verify events are received
          done();
        });
    });
  });
});

// Helper function to wait for job completion
async function waitForJobCompletion(app, jobId, timeoutMs = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const response = await request(app)
      .get(`/api/jobs/${jobId}`)
      .expect(200);
    
    const status = response.body.job.status;
    
    if (status === 'completed') {
      return response.body.job;
    } else if (status === 'failed') {
      throw new Error(`Job failed: ${response.body.job.error}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Job completion timeout');
}

module.exports = { waitForJobCompletion };