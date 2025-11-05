const request = require('supertest');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const Document = require('../src/models/Document');
const Page = require('../src/models/Page');
const Job = require('../src/models/Job');

// Test data
const seedData = {
  documents: [
    {
      _id: new mongoose.Types.ObjectId(),
      filename: 'test-doc-1.pdf',
      originalName: 'Sample Document 1.pdf',
      fileHash: 'hash123',
      mimeType: 'application/pdf',
      size: 1024,
      totalPages: 2,
      processedPages: 2,
      status: 'completed',
      jobId: 'job-123',
      uploadedAt: new Date(),
      processedAt: new Date()
    }
  ],
  pages: [
    {
      documentId: null, // Will be set from document
      pageNumber: 1,
      text: 'This is sample text from page one containing searchable content about artificial intelligence and machine learning.',
      confidence: 95.5,
      status: 'completed',
      processedAt: new Date()
    },
    {
      documentId: null,
      pageNumber: 2,
      text: 'Second page contains information about data processing and document analysis systems.',
      confidence: 92.3,
      status: 'completed',
      processedAt: new Date()
    }
  ],
  jobs: [
    {
      jobId: 'job-123',
      documentId: null,
      status: 'completed',
      progress: 100,
      totalPages: 2,
      processedPages: 2,
      createdAt: new Date(),
      completedAt: new Date()
    }
  ]
};

describe('Document OCR & Search API', () => {
  beforeAll(async () => {
    // Seed test data
    const doc = await Document.create(seedData.documents[0]);
    seedData.pages[0].documentId = doc._id;
    seedData.pages[1].documentId = doc._id;
    seedData.jobs[0].documentId = doc._id;
    
    await Page.create(seedData.pages);
    await Job.create(seedData.jobs[0]);
  });

  afterAll(async () => {
    // Cleanup
    await Document.deleteMany({});
    await Page.deleteMany({});
    await Job.deleteMany({});
  });

  describe('POST /api/upload', () => {
    it('should upload a document successfully', async () => {
      const testFilePath = path.join(__dirname, 'test.txt');
      fs.writeFileSync(testFilePath, 'Sample document content for testing OCR processing.');

      const response = await request(app)
        .post('/api/upload')
        .attach('document', testFilePath)
        .expect(200);

      expect(response.body).toHaveProperty('jobId');
      expect(response.body).toHaveProperty('documentId');
      expect(response.body.message).toBe('Document uploaded successfully');

      fs.unlinkSync(testFilePath);
    });

    it('should detect duplicate documents', async () => {
      const testFilePath = path.join(__dirname, 'duplicate.txt');
      fs.writeFileSync(testFilePath, 'Same content');

      // Upload first time
      await request(app)
        .post('/api/upload')
        .attach('document', testFilePath)
        .expect(200);

      // Upload same file again
      const response = await request(app)
        .post('/api/upload')
        .attach('document', testFilePath)
        .expect(200);

      expect(response.body.message).toBe('Document already exists');
      fs.unlinkSync(testFilePath);
    });

    it('should reject upload without file', async () => {
      const response = await request(app)
        .post('/api/upload')
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });
  });

  describe('GET /api/job/:id', () => {
    it('should return job status', async () => {
      const response = await request(app)
        .get('/api/jobs/job-123')
        .expect(200);

      expect(response.body.job.status).toBe('completed');
      expect(response.body.job.progress).toBe(100);
    });

    it('should return 404 for non-existent job', async () => {
      const response = await request(app)
        .get('/api/jobs/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Job not found');
    });
  });

  describe('GET /api/documents', () => {
    it('should return documents list', async () => {
      const response = await request(app)
        .get('/api/documents')
        .expect(200);

      expect(response.body).toHaveProperty('documents');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.documents)).toBe(true);
      expect(response.body.documents.length).toBeGreaterThan(0);
    });

    it('should return document pages', async () => {
      const doc = await Document.findOne({ status: 'completed' });
      const response = await request(app)
        .get(`/api/documents/${doc._id}/pages`)
        .expect(200);

      expect(response.body.pages).toHaveLength(2);
      expect(response.body.pages[0].pageNumber).toBe(1);
    });
  });

  describe('POST /api/documents/:id/reprocess', () => {
    it('should reprocess document with custom parameters', async () => {
      const doc = await Document.findOne({ status: 'completed' });
      const response = await request(app)
        .post(`/api/documents/${doc._id}/reprocess`)
        .send({
          language: 'spa',
          preprocess: {
            binarize: true,
            threshold: 150
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('jobId');
      expect(response.body.message).toBe('Document reprocessing started');
      expect(response.body.parameters.language).toBe('spa');
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/documents/${fakeId}/reprocess`)
        .expect(404);

      expect(response.body.error).toBe('Document not found');
    });
  });

  describe('GET /api/search', () => {
    it('should search documents and return highlighted results', async () => {
      const response = await request(app)
        .get('/api/search?q=artificial intelligence')
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.query).toBe('artificial intelligence');
      
      if (response.body.results.length > 0) {
        const result = response.body.results[0];
        expect(result).toHaveProperty('documentId');
        expect(result).toHaveProperty('pageNumber');
        expect(result).toHaveProperty('snippet');
        expect(result.snippet).toContain('<mark>');
      }
    });

    it('should require query parameter', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(400);

      expect(response.body.error).toBe('Query parameter is required');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/search?q=text&page=1&limit=5')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});

// Integration test for complete workflow
describe('Complete OCR Workflow', () => {
  it('should complete upload -> process -> search workflow', async () => {
    // 1. Upload document
    const testFilePath = path.join(__dirname, 'workflow-test.txt');
    fs.writeFileSync(testFilePath, 'Machine learning algorithms process data efficiently.');

    const uploadResponse = await request(app)
      .post('/api/upload')
      .attach('document', testFilePath);

    expect(uploadResponse.status).toBe(200);
    const { jobId, documentId } = uploadResponse.body;

    // 2. Wait for processing (in real scenario, would poll job status)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Check job status
    const jobResponse = await request(app)
      .get(`/api/jobs/${jobId}`);

    // 4. Search for content
    const searchResponse = await request(app)
      .get('/api/search?q=machine learning')
      .expect(200);

    expect(searchResponse.body.results).toBeDefined();

    fs.unlinkSync(testFilePath);
  }, 10000);
});