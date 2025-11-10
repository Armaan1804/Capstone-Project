import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FileText, Upload, Search as SearchIcon, Activity } from 'lucide-react';
import UploadPage from './pages/Upload';
import JobStatus from './pages/JobStatus';
import SearchPage from './pages/Search';
import DocumentViewer from './pages/DocumentViewer';
import Documents from './pages/Documents';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900">Document Searcher</span>
          </Link>
          
          <div className="flex space-x-8">
            <Link
              to="/upload"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/upload')
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Link>
            
            <Link
              to="/search"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/search')
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SearchIcon className="h-4 w-4" />
              <span>Search</span>
            </Link>
            
            <Link
              to="/documents"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/documents')
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const HomePage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="mb-12">
        <FileText className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Document OCR & Search
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload documents, extract text with OCR, and search through your content
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card text-center">
          <Upload className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 mb-4">
            Upload PDF, images, or text files for OCR processing
          </p>
          <Link to="/upload" className="btn-primary">
            Start Upload
          </Link>
        </div>

        <div className="card text-center">
          <Activity className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
          <p className="text-gray-600 mb-4">
            Monitor OCR processing with real-time updates
          </p>
          <div className="btn-secondary cursor-default">
            Real-time Updates
          </div>
        </div>

        <div className="card text-center">
          <SearchIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Content</h3>
          <p className="text-gray-600 mb-4">
            Find text across all your processed documents
          </p>
          <Link to="/search" className="btn-primary">
            Search Now
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">How it works</h2>
        <div className="grid md:grid-cols-4 gap-6 text-left">
          <div className="flex items-start">
            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Upload</h4>
              <p className="text-sm text-gray-600">Upload your documents</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Process</h4>
              <p className="text-sm text-gray-600">OCR extracts text</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Index</h4>
              <p className="text-sm text-gray-600">Text is indexed</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
              4
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Search</h4>
              <p className="text-sm text-gray-600">Find any content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/job/:jobId" element={<JobStatus />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/document/:documentId" element={<DocumentViewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;