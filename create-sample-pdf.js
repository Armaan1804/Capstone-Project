// Simple script to create a sample PDF for testing
// Run with: node create-sample-pdf.js

const fs = require('fs');
const path = require('path');

// Create a simple text file that can be converted to PDF
const sampleContent = `Sample Document for OCR Testing

This is a test document for the MERN Document Search application.

Key Features to Test:
1. Document upload functionality
2. OCR text extraction
3. Full-text search capabilities
4. Real-time processing updates

Technical Stack:
- MongoDB for document storage
- Express.js for API endpoints
- React for user interface
- Node.js for backend processing
- Tesseract.js for OCR
- BullMQ for job queuing
- Redis for caching

Search Terms:
The following terms should be searchable after OCR processing:
- "sample document"
- "OCR testing"
- "MERN stack"
- "text extraction"
- "search functionality"

Contact Information:
Email: test@example.com
Phone: (555) 123-4567
Website: https://example.com

This document contains enough text content to test the OCR
functionality and search capabilities of the application.

End of test document.`;

// Write to seed-data directory
const seedDataDir = path.join(__dirname, 'seed-data');
if (!fs.existsSync(seedDataDir)) {
  fs.mkdirSync(seedDataDir);
}

const filePath = path.join(seedDataDir, 'sample-document.txt');
fs.writeFileSync(filePath, sampleContent);

console.log('Sample document created at:', filePath);
console.log('Convert this to PDF using an online converter or print to PDF for testing.');
console.log('Alternatively, you can upload this text file directly if your app supports it.');