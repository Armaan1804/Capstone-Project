#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

function warning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Test functions
async function testHealthCheck() {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.data.status === 'OK') {
      success('Health check passed');
      return true;
    } else {
      error('Health check failed - invalid response');
      return false;
    }
  } catch (err) {
    error(`Health check failed: ${err.message}`);
    return false;
  }
}

async function testDocumentUpload() {
  try {
    // Create test document
    const testContent = `Test Document for Validation
    
This is a test document created for system validation. It contains searchable text content including:
- Machine learning algorithms
- Artificial intelligence concepts  
- Data processing techniques
- Document analysis systems
- OCR technology validation

The system should be able to process this document and make it searchable.`;

    const testFilePath = path.join(__dirname, 'validation-test.txt');
    fs.writeFileSync(testFilePath, testContent);

    // Upload document
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath));

    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });

    if (response.data.jobId && response.data.documentId) {
      success('Document upload successful');
      info(`Job ID: ${response.data.jobId}`);
      info(`Document ID: ${response.data.documentId}`);
      
      // Cleanup
      fs.unlinkSync(testFilePath);
      
      return {
        jobId: response.data.jobId,
        documentId: response.data.documentId
      };
    } else {
      error('Document upload failed - invalid response');
      return null;
    }
  } catch (err) {
    error(`Document upload failed: ${err.message}`);
    return null;
  }
}

async function testJobStatus(jobId) {
  try {
    const response = await axios.get(`${API_BASE}/jobs/${jobId}`);
    
    if (response.data.job) {
      const job = response.data.job;
      success(`Job status retrieved: ${job.status} (${job.progress}%)`);
      return job;
    } else {
      error('Job status retrieval failed - invalid response');
      return null;
    }
  } catch (err) {
    error(`Job status retrieval failed: ${err.message}`);
    return null;
  }
}

async function waitForJobCompletion(jobId, maxWaitTime = 60000) {
  const startTime = Date.now();
  info(`Waiting for job ${jobId} to complete...`);
  
  while (Date.now() - startTime < maxWaitTime) {
    const job = await testJobStatus(jobId);
    
    if (!job) {
      return false;
    }
    
    if (job.status === 'completed') {
      success(`Job completed successfully in ${Math.round((Date.now() - startTime) / 1000)}s`);
      return true;
    } else if (job.status === 'failed') {
      error(`Job failed: ${job.error || 'Unknown error'}`);
      return false;
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  warning('Job completion timeout reached');
  return false;
}

async function testDocumentsList() {
  try {
    const response = await axios.get(`${API_BASE}/documents`);
    
    if (response.data.documents && Array.isArray(response.data.documents)) {
      success(`Documents list retrieved (${response.data.documents.length} documents)`);
      return response.data.documents;
    } else {
      error('Documents list retrieval failed - invalid response');
      return null;
    }
  } catch (err) {
    error(`Documents list retrieval failed: ${err.message}`);
    return null;
  }
}

async function testDocumentPages(documentId) {
  try {
    const response = await axios.get(`${API_BASE}/documents/${documentId}/pages`);
    
    if (response.data.pages && Array.isArray(response.data.pages)) {
      success(`Document pages retrieved (${response.data.pages.length} pages)`);
      return response.data.pages;
    } else {
      error('Document pages retrieval failed - invalid response');
      return null;
    }
  } catch (err) {
    error(`Document pages retrieval failed: ${err.message}`);
    return null;
  }
}

async function testSearch(query) {
  try {
    const response = await axios.get(`${API_BASE}/search`, {
      params: { q: query }
    });
    
    if (response.data.results && Array.isArray(response.data.results)) {
      success(`Search completed for "${query}" (${response.data.results.length} results)`);
      
      // Check for highlighting
      if (response.data.results.length > 0) {
        const hasHighlighting = response.data.results.some(result => 
          result.snippet && result.snippet.includes('<mark>')
        );
        
        if (hasHighlighting) {
          success('Search results include highlighting');
        } else {
          warning('Search results missing highlighting');
        }
      }
      
      return response.data.results;
    } else {
      error('Search failed - invalid response');
      return null;
    }
  } catch (err) {
    error(`Search failed: ${err.message}`);
    return null;
  }
}

async function testReprocessing(documentId) {
  try {
    const response = await axios.post(`${API_BASE}/documents/${documentId}/reprocess`, {
      language: 'eng',
      preprocess: {
        binarize: true,
        threshold: 150
      }
    });
    
    if (response.data.jobId) {
      success('Document reprocessing initiated');
      info(`Reprocess Job ID: ${response.data.jobId}`);
      return response.data.jobId;
    } else {
      error('Document reprocessing failed - invalid response');
      return null;
    }
  } catch (err) {
    error(`Document reprocessing failed: ${err.message}`);
    return null;
  }
}

async function testErrorHandling() {
  info('Testing error handling...');
  
  // Test invalid job ID
  try {
    await axios.get(`${API_BASE}/jobs/invalid-job-id`);
    error('Invalid job ID should return 404');
  } catch (err) {
    if (err.response && err.response.status === 404) {
      success('Invalid job ID correctly returns 404');
    } else {
      error(`Unexpected error for invalid job ID: ${err.message}`);
    }
  }
  
  // Test search without query
  try {
    await axios.get(`${API_BASE}/search`);
    error('Search without query should return 400');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      success('Search without query correctly returns 400');
    } else {
      error(`Unexpected error for search without query: ${err.message}`);
    }
  }
  
  // Test upload without file
  try {
    await axios.post(`${API_BASE}/upload`);
    error('Upload without file should return 400');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      success('Upload without file correctly returns 400');
    } else {
      error(`Unexpected error for upload without file: ${err.message}`);
    }
  }
}

async function runValidation() {
  log('\n=== Document OCR & Search System Validation ===\n', 'blue');
  
  let allTestsPassed = true;
  
  // 1. Health Check
  info('1. Testing health check...');
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    allTestsPassed = false;
    error('System health check failed. Please ensure the backend is running.');
    return;
  }
  
  // 2. Document Upload
  info('\n2. Testing document upload...');
  const uploadResult = await testDocumentUpload();
  if (!uploadResult) {
    allTestsPassed = false;
    error('Document upload failed. Cannot proceed with further tests.');
    return;
  }
  
  // 3. Job Processing
  info('\n3. Testing job processing...');
  const jobCompleted = await waitForJobCompletion(uploadResult.jobId);
  if (!jobCompleted) {
    allTestsPassed = false;
    warning('Job processing test failed or timed out.');
  }
  
  // 4. Documents List
  info('\n4. Testing documents list...');
  const documents = await testDocumentsList();
  if (!documents) {
    allTestsPassed = false;
  }
  
  // 5. Document Pages
  info('\n5. Testing document pages...');
  const pages = await testDocumentPages(uploadResult.documentId);
  if (!pages) {
    allTestsPassed = false;
  }
  
  // 6. Search Functionality
  info('\n6. Testing search functionality...');
  const searchQueries = [
    'machine learning',
    'artificial intelligence', 
    'data processing',
    'validation'
  ];
  
  for (const query of searchQueries) {
    const results = await testSearch(query);
    if (!results) {
      allTestsPassed = false;
    }
  }
  
  // 7. Document Reprocessing
  info('\n7. Testing document reprocessing...');
  const reprocessJobId = await testReprocessing(uploadResult.documentId);
  if (!reprocessJobId) {
    allTestsPassed = false;
  } else {
    // Wait a bit for reprocessing (don't wait for completion)
    await new Promise(resolve => setTimeout(resolve, 5000));
    await testJobStatus(reprocessJobId);
  }
  
  // 8. Error Handling
  info('\n8. Testing error handling...');
  await testErrorHandling();
  
  // Summary
  log('\n=== Validation Summary ===\n', 'blue');
  
  if (allTestsPassed) {
    success('All validation tests passed! ✨');
    log('\nThe system is working correctly. You can now:', 'green');
    log('- Upload documents via POST /api/upload');
    log('- Monitor jobs via GET /api/jobs/:jobId');
    log('- Search documents via GET /api/search?q=query');
    log('- List documents via GET /api/documents');
    log('- Reprocess documents via POST /api/documents/:id/reprocess');
  } else {
    error('Some validation tests failed. Please check the logs above.');
    log('\nCommon issues:', 'yellow');
    log('- Backend server not running (check docker-compose up)');
    log('- MongoDB not accessible');
    log('- Redis not accessible');
    log('- Worker not processing jobs');
  }
  
  log('\nFor more detailed testing, run: npm test', 'blue');
}

// Handle command line execution
if (require.main === module) {
  runValidation().catch(err => {
    error(`Validation failed with error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  testHealthCheck,
  testDocumentUpload,
  testJobStatus,
  waitForJobCompletion,
  testDocumentsList,
  testDocumentPages,
  testSearch,
  testReprocessing,
  testErrorHandling,
  runValidation
};