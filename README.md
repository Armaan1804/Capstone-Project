# MERN Document Search & OCR

A full-stack web application for uploading documents, extracting text using OCR, and searching through document content with real-time processing updates.

## Features

- **Document Upload**: Support for PDF, images, and text files
- **OCR Processing**: Automatic text extraction from uploaded documents
- **Real-time Updates**: WebSocket-based job progress tracking
- **Full-text Search**: Search across all processed documents
- **Document Management**: View and manage all uploaded documents
- **Document Viewer**: View processed documents with extracted text
- **Job Management**: Track processing status and progress

## Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Socket.IO Client** for real-time updates
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Socket.IO** for real-time communication
- **Multer** for file uploads
- **Helmet** for security
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

## Project Structure

```
mern-document-search/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Upload.jsx
│   │   │   ├── JobStatus.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── DocumentViewer.jsx
│   │   │   └── Documents.jsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── src/
    │   ├── models/
    │   │   ├── Document.js
    │   │   ├── Job.js
    │   │   └── Page.js
    │   ├── routes/
    │   │   ├── upload.js
    │   │   ├── jobs.js
    │   │   ├── documents.js
    │   │   ├── search.js
    │   │   └── pages.js
    │   ├── middleware/
    │   │   └── upload.js
    │   ├── utils/
    │   │   ├── database.js
    │   │   ├── fileHash.js
    │   │   ├── queue.js
    │   │   └── simpleQueue.js
    │   └── server.js
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/document-search
FRONTEND_URL=http://localhost:5173
```

4. Create uploads directory:
```bash
mkdir uploads
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Upload
- `POST /api/upload` - Upload document for processing

### Jobs
- `GET /api/jobs/:jobId` - Get job status and progress

### Documents
- `GET /api/documents` - List all processed documents
- `GET /api/documents/:id/pages` - Get document pages
- `POST /api/documents/:id/reprocess` - Reprocess document

### Search
- `GET /api/search?q=query` - Search documents

### Pages
- `GET /api/pages/:id` - Get specific page content

## Database Schema

### Document Model
```javascript
{
  filename: String,
  originalName: String,
  fileHash: String,
  mimeType: String,
  size: Number,
  status: String, // 'pending', 'processing', 'completed', 'failed'
  totalPages: Number,
  processedPages: Number,
  jobId: String,
  uploadedAt: Date,
  processedAt: Date,
  error: String
}
```

### Job Model
```javascript
{
  jobId: String,
  documentId: ObjectId,
  status: String, // 'waiting', 'active', 'completed', 'failed'
  progress: Number,
  totalPages: Number,
  processedPages: Number,
  createdAt: Date,
  completedAt: Date,
  error: String
}
```

### Page Model
```javascript
{
  documentId: ObjectId,
  pageNumber: Number,
  text: String,
  confidence: Number,
  status: String,
  processedAt: Date
}
```

## Usage

1. **Upload Documents**: Go to Upload page and select files
2. **Track Progress**: Monitor processing in real-time via job status
3. **Manage Documents**: View all uploaded documents on Documents page
4. **Search Content**: Use Search page to find text across documents
5. **View Documents**: Click on search results to view full documents

## WebSocket Events

### Client → Server
- `join-job` - Join job room for updates

### Server → Client
- `job-progress` - Job processing progress
- `job-completed` - Job completion notification
- `job-failed` - Job failure notification

## Development Notes

### Queue System
The application uses a simple in-memory queue for demo purposes. For production, consider implementing Redis-based queues.

### OCR Processing
Currently uses mock OCR processing. Integrate with services like Tesseract.js or cloud OCR APIs for production.

### File Storage
Files are stored locally in the `uploads` directory. For production, consider cloud storage solutions.

## Environment Variables

### Backend
- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

## Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details