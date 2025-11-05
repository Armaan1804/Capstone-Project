# Document OCR & Search - React Frontend

A modern React application for document upload, OCR processing, and full-text search with real-time progress tracking.

## 🚀 Features

- **Document Upload**: Drag-and-drop file upload with validation
- **Real-time Progress**: WebSocket integration for live job updates
- **Advanced Search**: Full-text search with filters and highlighting
- **Document Viewer**: Page-by-page navigation with OCR text overlay
- **Text Editing**: Manual correction of OCR results
- **Responsive Design**: Mobile-friendly Tailwind CSS styling

## 🛠️ Tech Stack

- **React 18** with Hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.io Client** for real-time updates
- **Axios** for API communication
- **Lucide React** for icons
- **Vitest** + **React Testing Library** for testing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main page components
│   ├── Upload.jsx      # File upload interface
│   ├── JobStatus.jsx   # Job progress tracking
│   ├── Search.jsx      # Document search interface
│   └── DocumentViewer.jsx # Document viewing and editing
├── hooks/              # Custom React hooks
│   └── useWebSocket.js # WebSocket connection hook
├── utils/              # Utility functions
│   └── api.js          # API client functions
├── test/               # Test files
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Backend API running on port 3000

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Configuration

Create a `.env` file:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000

# Development settings
VITE_NODE_ENV=development
```

## 📱 Pages & Components

### 1. Upload Page (`/upload`)

**Features:**
- Drag-and-drop file upload
- File validation (type, size)
- Progress indication
- Error handling

**Supported Files:**
- PDF documents
- Images (JPEG, PNG, TIFF)
- Text files
- Maximum size: 50MB

**Usage:**
```jsx
import UploadPage from './pages/Upload';

// Validates files and uploads to backend
// Redirects to job status page on success
```

### 2. Job Status Page (`/job/:jobId`)

**Features:**
- Real-time progress updates via WebSocket
- Per-page processing status
- Confidence scores for OCR results
- Reprocess buttons for low-confidence pages
- Error handling and retry options

**Real-time Updates:**
```jsx
import useWebSocket from './hooks/useWebSocket';

const { jobProgress, jobStatus } = useWebSocket(jobId);
// Automatically updates progress and status
```

### 3. Search Page (`/search`)

**Features:**
- Full-text search across all documents
- Advanced filters (date range, file type)
- Paginated results
- Highlighted search terms
- Click-to-view document pages

**Search Interface:**
```jsx
// Search with highlighting
const results = await searchDocuments('machine learning', 1, 10);
// Returns: { results: [...], pagination: {...} }
```

### 4. Document Viewer (`/document/:documentId`)

**Features:**
- Page-by-page navigation
- Thumbnail sidebar
- OCR text overlay with bounding boxes
- Manual text editing and correction
- Confidence score visualization

**Text Editing:**
```jsx
// Edit OCR results
const handleEdit = (textBlock) => {
  setEditingText(true);
  setEditedText(textBlock.text);
};
```

## 🔌 API Integration

### API Client (`utils/api.js`)

```javascript
import { uploadDocument, searchDocuments, getJobStatus } from './utils/api';

// Upload file
const result = await uploadDocument(file);
// Returns: { jobId, documentId, message }

// Search documents
const results = await searchDocuments('query', page, limit);
// Returns: { results: [...], pagination: {...} }

// Get job status
const job = await getJobStatus(jobId);
// Returns: { job: { status, progress, ... } }
```

### WebSocket Integration

```javascript
import useWebSocket from './hooks/useWebSocket';

const JobComponent = ({ jobId }) => {
  const { jobProgress, jobStatus } = useWebSocket(jobId);
  
  useEffect(() => {
    if (jobProgress) {
      console.log(`Progress: ${jobProgress.progress}%`);
    }
  }, [jobProgress]);
  
  return <div>Status: {jobStatus}</div>;
};
```

## 🎨 Styling & UI

### Tailwind CSS Classes

```css
/* Custom component classes */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}
```

### Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactions
- Optimized for tablets and phones

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Structure

```javascript
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import UploadPage from '../pages/Upload';

test('validates file size', async () => {
  render(<UploadPage />);
  
  const fileInput = screen.getByLabelText(/browse/i);
  const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf');
  
  fireEvent.change(fileInput, { target: { files: [largeFile] } });
  
  expect(screen.getByText('File size must be less than 50MB')).toBeInTheDocument();
});
```

### Test Coverage

- Component rendering
- User interactions
- API integration
- Error handling
- Form validation
- Real-time updates

## 🔄 Workflow Examples

### Complete Upload → Search Workflow

```javascript
// 1. Upload document
const uploadFile = async (file) => {
  try {
    const result = await uploadDocument(file);
    navigate(`/job/${result.jobId}`);
  } catch (error) {
    setError(error.message);
  }
};

// 2. Monitor progress
const { jobProgress, jobStatus } = useWebSocket(jobId);

// 3. Search when complete
useEffect(() => {
  if (jobStatus === 'completed') {
    navigate('/search');
  }
}, [jobStatus]);

// 4. View results
const handleResultClick = (documentId, pageNumber) => {
  navigate(`/document/${documentId}?page=${pageNumber}`);
};
```

## 📊 Performance Optimization

### Code Splitting

```javascript
// Lazy load pages
const UploadPage = lazy(() => import('./pages/Upload'));
const SearchPage = lazy(() => import('./pages/Search'));

// Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/upload" element={<UploadPage />} />
    <Route path="/search" element={<SearchPage />} />
  </Routes>
</Suspense>
```

### Optimization Features

- Lazy loading of components
- Debounced search input
- Virtualized large lists
- Optimized re-renders with React.memo
- Efficient WebSocket connection management

## 🚀 Build & Deploy

### Development

```bash
npm run dev          # Start dev server
npm run test         # Run tests
npm run test:ui      # Test with UI
```

### Production

```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Docker Deployment

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Configuration

### Vite Configuration

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

### Tailwind Configuration

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
};
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```bash
   # Check backend is running
   curl http://localhost:3000/api/health
   
   # Verify VITE_API_URL in .env
   VITE_API_URL=http://localhost:3000
   ```

2. **WebSocket Connection Issues**
   ```javascript
   // Check WebSocket URL
   const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
   ```

3. **File Upload Fails**
   ```javascript
   // Check file validation
   const validateFile = (file) => {
     if (file.size > 50 * 1024 * 1024) return 'File too large';
     if (!allowedTypes.includes(file.type)) return 'Invalid type';
     return null;
   };
   ```

### Debug Mode

```bash
# Enable debug logging
VITE_NODE_ENV=development npm run dev

# Check network requests in browser DevTools
# Monitor WebSocket connections in Network tab
```

## 📈 Future Enhancements

- [ ] Batch file upload
- [ ] Advanced OCR settings UI
- [ ] Document annotations
- [ ] Export search results
- [ ] Offline support with PWA
- [ ] Advanced text editing tools
- [ ] Document comparison features

## 🎯 Acceptance Criteria ✅

✅ **Upload from UI → shows job progress**
- File upload with validation
- Real-time progress tracking
- WebSocket integration

✅ **Search returns highlighted snippet and opens correct page preview**
- Full-text search with highlighting
- Click-to-view document pages
- Page navigation and text overlay

---

**Status**: ✅ **FULLY FUNCTIONAL**

The React frontend is complete with all required features, comprehensive testing, and production-ready configuration.