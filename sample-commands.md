# Sample cURL Commands for Document OCR & Search API

## Prerequisites

1. Start the services:
```bash
docker-compose up -d
# OR manually start MongoDB, Redis, Backend, and Worker
```

2. Create test files:
```bash
echo "This is a sample document containing artificial intelligence and machine learning concepts." > sample.txt
echo "Advanced data processing techniques for document analysis systems." > advanced.txt
```

## Complete Workflow Examples

### Example 1: Basic Upload and Search

```bash
#!/bin/bash

echo "=== Document Upload & Search Workflow ==="

# 1. Upload document
echo "1. Uploading document..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "document=@sample.txt")

echo "Upload Response: $UPLOAD_RESPONSE"

JOB_ID=$(echo $UPLOAD_RESPONSE | jq -r '.jobId')
DOC_ID=$(echo $UPLOAD_RESPONSE | jq -r '.documentId')

echo "Job ID: $JOB_ID"
echo "Document ID: $DOC_ID"

# 2. Monitor job progress
echo -e "\n2. Monitoring job progress..."
while true; do
  JOB_STATUS=$(curl -s http://localhost:3000/api/jobs/$JOB_ID)
  STATUS=$(echo $JOB_STATUS | jq -r '.job.status')
  PROGRESS=$(echo $JOB_STATUS | jq -r '.job.progress')
  
  echo "Status: $STATUS, Progress: $PROGRESS%"
  
  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
    break
  fi
  
  sleep 2
done

# 3. Search for content
echo -e "\n3. Searching for 'artificial intelligence'..."
SEARCH_RESPONSE=$(curl -s "http://localhost:3000/api/search?q=artificial%20intelligence")
echo "Search Results:"
echo $SEARCH_RESPONSE | jq '.results'

echo -e "\n4. Searching for 'machine learning'..."
SEARCH_RESPONSE=$(curl -s "http://localhost:3000/api/search?q=machine%20learning")
echo "Search Results:"
echo $SEARCH_RESPONSE | jq '.results'
```

### Example 2: Document Reprocessing

```bash
#!/bin/bash

echo "=== Document Reprocessing Workflow ==="

# 1. Upload document first
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "document=@advanced.txt")

DOC_ID=$(echo $UPLOAD_RESPONSE | jq -r '.documentId')
echo "Document ID: $DOC_ID"

# Wait for initial processing
sleep 5

# 2. Reprocess with Spanish language
echo -e "\n2. Reprocessing with Spanish language..."
REPROCESS_RESPONSE=$(curl -s -X POST http://localhost:3000/api/documents/$DOC_ID/reprocess \
  -H "Content-Type: application/json" \
  -d '{
    "language": "spa",
    "preprocess": {
      "binarize": true,
      "threshold": 150
    }
  }')

echo "Reprocess Response: $REPROCESS_RESPONSE"

NEW_JOB_ID=$(echo $REPROCESS_RESPONSE | jq -r '.jobId')

# 3. Monitor reprocessing
echo -e "\n3. Monitoring reprocessing..."
while true; do
  JOB_STATUS=$(curl -s http://localhost:3000/api/jobs/$NEW_JOB_ID)
  STATUS=$(echo $JOB_STATUS | jq -r '.job.status')
  
  echo "Reprocessing Status: $STATUS"
  
  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
    break
  fi
  
  sleep 2
done
```

## Individual API Calls

### 1. Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Upload Document
```bash
# Text file
curl -X POST http://localhost:3000/api/upload \
  -F "document=@sample.txt"

# PDF file
curl -X POST http://localhost:3000/api/upload \
  -F "document=@document.pdf"

# Image file
curl -X POST http://localhost:3000/api/upload \
  -F "document=@scan.png"
```

**Expected Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "documentId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "message": "Document uploaded successfully"
}
```

### 3. Check Job Status
```bash
# Replace with actual job ID
curl -X GET http://localhost:3000/api/jobs/550e8400-e29b-41d4-a716-446655440000
```

**Expected Responses:**

*Processing:*
```json
{
  "job": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "active",
    "progress": 65,
    "totalPages": 3,
    "processedPages": 2,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

*Completed:*
```json
{
  "job": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "progress": 100,
    "totalPages": 3,
    "processedPages": 3,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "completedAt": "2024-01-15T10:32:15.000Z"
  }
}
```

### 4. List Documents
```bash
# All documents
curl -X GET http://localhost:3000/api/documents

# With pagination
curl -X GET "http://localhost:3000/api/documents?page=1&limit=5"
```

### 5. Get Document Pages
```bash
# Replace with actual document ID
curl -X GET http://localhost:3000/api/documents/64f8a1b2c3d4e5f6a7b8c9d0/pages
```

**Expected Response:**
```json
{
  "pages": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "documentId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "pageNumber": 1,
      "text": "This is the extracted text from page 1...",
      "confidence": 95.2,
      "status": "completed",
      "processedAt": "2024-01-15T10:32:00.000Z"
    }
  ]
}
```

### 6. Search Documents
```bash
# Basic search
curl -X GET "http://localhost:3000/api/search?q=machine%20learning"

# Search with pagination
curl -X GET "http://localhost:3000/api/search?q=artificial%20intelligence&page=1&limit=10"

# Search for specific terms
curl -X GET "http://localhost:3000/api/search?q=data%20processing"
```

**Expected Response:**
```json
{
  "results": [
    {
      "documentId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "documentName": "sample.txt",
      "pageNumber": 1,
      "snippet": "...containing <mark>artificial</mark> <mark>intelligence</mark> and machine...",
      "confidence": 95.2,
      "score": 1.8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  },
  "query": "artificial intelligence"
}
```

### 7. Reprocess Document
```bash
# Basic reprocessing
curl -X POST http://localhost:3000/api/documents/64f8a1b2c3d4e5f6a7b8c9d0/reprocess \
  -H "Content-Type: application/json" \
  -d '{}'

# Reprocess with Spanish language
curl -X POST http://localhost:3000/api/documents/64f8a1b2c3d4e5f6a7b8c9d0/reprocess \
  -H "Content-Type: application/json" \
  -d '{
    "language": "spa"
  }'

# Reprocess with custom preprocessing
curl -X POST http://localhost:3000/api/documents/64f8a1b2c3d4e5f6a7b8c9d0/reprocess \
  -H "Content-Type: application/json" \
  -d '{
    "language": "eng",
    "preprocess": {
      "binarize": true,
      "threshold": 150,
      "denoise": true,
      "deskew": true
    }
  }'

# Reprocess with rotation
curl -X POST http://localhost:3000/api/documents/64f8a1b2c3d4e5f6a7b8c9d0/reprocess \
  -H "Content-Type: application/json" \
  -d '{
    "language": "eng",
    "preprocess": {
      "rotate": 90,
      "binarize": true,
      "threshold": 128
    }
  }'
```

## Error Handling Examples

### 1. Upload without file
```bash
curl -X POST http://localhost:3000/api/upload
```
**Response:** `400 Bad Request`
```json
{
  "error": "No file uploaded"
}
```

### 2. Search without query
```bash
curl -X GET http://localhost:3000/api/search
```
**Response:** `400 Bad Request`
```json
{
  "error": "Query parameter is required"
}
```

### 3. Non-existent job
```bash
curl -X GET http://localhost:3000/api/jobs/non-existent-job-id
```
**Response:** `404 Not Found`
```json
{
  "error": "Job not found"
}
```

### 4. Non-existent document for reprocessing
```bash
curl -X POST http://localhost:3000/api/documents/64f8a1b2c3d4e5f6a7b8c9d9/reprocess \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Response:** `404 Not Found`
```json
{
  "error": "Document not found"
}
```

## Performance Testing

### 1. Concurrent Uploads
```bash
#!/bin/bash

echo "=== Concurrent Upload Test ==="

for i in {1..5}; do
  echo "Test content for document $i" > test_$i.txt
  
  curl -X POST http://localhost:3000/api/upload \
    -F "document=@test_$i.txt" &
done

wait
echo "All uploads completed"
```

### 2. Search Performance
```bash
#!/bin/bash

echo "=== Search Performance Test ==="

QUERIES=("machine learning" "artificial intelligence" "data processing" "document analysis" "text extraction")

for query in "${QUERIES[@]}"; do
  echo "Searching for: $query"
  time curl -s "http://localhost:3000/api/search?q=$(echo $query | sed 's/ /%20/g')" > /dev/null
done
```

### 3. Load Testing with Multiple Searches
```bash
#!/bin/bash

echo "=== Load Testing ==="

for i in {1..20}; do
  curl -s "http://localhost:3000/api/search?q=test" > /dev/null &
done

wait
echo "Load test completed"
```

## WebSocket Testing

### Using wscat (install with: npm install -g wscat)
```bash
# Connect to WebSocket
wscat -c ws://localhost:3000

# After connection, join a job room
{"type": "join-job", "jobId": "your-job-id"}
```

### Using curl for SSE (if implemented)
```bash
curl -N -H "Accept: text/event-stream" http://localhost:3000/api/jobs/your-job-id/events
```

## Cleanup Commands

```bash
# Remove test files
rm -f sample.txt advanced.txt test_*.txt

# Reset database (careful!)
curl -X DELETE http://localhost:3000/api/admin/reset  # If implemented

# Stop Docker services
docker-compose down

# Remove Docker volumes (careful!)
docker-compose down -v
```

## Validation Script

```bash
#!/bin/bash

echo "=== API Validation Script ==="

# 1. Health check
echo "1. Health check..."
HEALTH=$(curl -s http://localhost:3000/api/health)
if echo $HEALTH | grep -q "OK"; then
  echo "✓ Health check passed"
else
  echo "✗ Health check failed"
  exit 1
fi

# 2. Upload test
echo "2. Upload test..."
echo "Sample validation document" > validation.txt
UPLOAD=$(curl -s -X POST http://localhost:3000/api/upload -F "document=@validation.txt")
if echo $UPLOAD | grep -q "jobId"; then
  echo "✓ Upload test passed"
  JOB_ID=$(echo $UPLOAD | jq -r '.jobId')
else
  echo "✗ Upload test failed"
  exit 1
fi

# 3. Job status test
echo "3. Job status test..."
sleep 3
JOB_STATUS=$(curl -s http://localhost:3000/api/jobs/$JOB_ID)
if echo $JOB_STATUS | grep -q "job"; then
  echo "✓ Job status test passed"
else
  echo "✗ Job status test failed"
fi

# 4. Search test
echo "4. Search test..."
sleep 5
SEARCH=$(curl -s "http://localhost:3000/api/search?q=validation")
if echo $SEARCH | grep -q "results"; then
  echo "✓ Search test passed"
else
  echo "✗ Search test failed"
fi

# 5. Documents list test
echo "5. Documents list test..."
DOCS=$(curl -s http://localhost:3000/api/documents)
if echo $DOCS | grep -q "documents"; then
  echo "✓ Documents list test passed"
else
  echo "✗ Documents list test failed"
fi

echo "=== Validation Complete ==="
rm -f validation.txt
```

Save this as `validate-api.sh` and run with:
```bash
chmod +x validate-api.sh
./validate-api.sh
```