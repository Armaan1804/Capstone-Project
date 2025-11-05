import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FileText, Edit3, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDocumentPages } from '../utils/api';

const DocumentViewer = () => {
  const { documentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [loading, setLoading] = useState(true);
  const [editingText, setEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [selectedTextBlock, setSelectedTextBlock] = useState(null);

  useEffect(() => {
    fetchPages();
  }, [documentId]);

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const fetchPages = async () => {
    try {
      const data = await getDocumentPages(documentId);
      setPages(data.pages);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPageData = pages.find(p => p.pageNumber === currentPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSearchParams({ page: pageNumber.toString() });
    setEditingText(false);
    setSelectedTextBlock(null);
  };

  const startEditing = (textBlock = null) => {
    setEditingText(true);
    setSelectedTextBlock(textBlock);
    setEditedText(textBlock ? textBlock.text : currentPageData?.text || '');
  };

  const saveEdit = () => {
    // In a real app, this would save to the backend
    console.log('Saving edited text:', editedText);
    setEditingText(false);
    setSelectedTextBlock(null);
    // Update local state
    if (currentPageData) {
      currentPageData.text = editedText;
    }
  };

  const cancelEdit = () => {
    setEditingText(false);
    setSelectedTextBlock(null);
    setEditedText('');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 90) return 'text-green-600 bg-green-50';
    if (confidence > 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentPageData) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600">The requested page could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex gap-6">
        {/* Page Thumbnails Sidebar */}
        <div className="w-64 flex-shrink-0">
          <h3 className="font-medium text-gray-900 mb-4">Pages</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pages.map((page) => (
              <div
                key={page._id}
                onClick={() => handlePageChange(page.pageNumber)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  page.pageNumber === currentPage
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Page {page.pageNumber}</span>
                  <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(page.confidence)}`}>
                    {page.confidence?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                  {page.text?.substring(0, 60)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Page {currentPage} of {pages.length}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(currentPageData.confidence)}`}>
                  {currentPageData.confidence?.toFixed(1)}% confidence
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pages.length}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Document Preview */}
            <div className="mb-6">
              <div className="relative bg-white border-2 border-gray-200 rounded-lg p-8 min-h-96">
                {/* Simulated document page */}
                <div className="w-full h-full bg-gray-50 rounded shadow-inner p-6">
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {currentPageData.text || 'No text extracted for this page.'}
                  </div>
                  
                  {/* OCR Text Blocks Overlay */}
                  {currentPageData.textBlocks?.map((block, index) => (
                    <div
                      key={index}
                      className="absolute border-2 border-blue-300 bg-blue-100 bg-opacity-30 cursor-pointer hover:bg-opacity-50"
                      style={{
                        left: `${(block.bbox?.x0 || 0) / 10}px`,
                        top: `${(block.bbox?.y0 || 0) / 10}px`,
                        width: `${((block.bbox?.x1 || 0) - (block.bbox?.x0 || 0)) / 10}px`,
                        height: `${((block.bbox?.y1 || 0) - (block.bbox?.y0 || 0)) / 10}px`,
                      }}
                      onClick={() => startEditing(block)}
                      title={`Confidence: ${block.confidence?.toFixed(1)}%`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Text Editor */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">OCR Text</h3>
                {!editingText && (
                  <button
                    onClick={() => startEditing()}
                    className="btn-secondary flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Text
                  </button>
                )}
              </div>

              {editingText ? (
                <div>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Edit the extracted text..."
                  />
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={cancelEdit}
                      className="btn-secondary flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="btn-primary flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {currentPageData.text || 'No text extracted for this page.'}
                  </pre>
                </div>
              )}
            </div>

            {/* Text Blocks Details */}
            {currentPageData.textBlocks?.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Text Blocks</h3>
                <div className="space-y-2">
                  {currentPageData.textBlocks.map((block, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => startEditing(block)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Block {index + 1}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(block.confidence)}`}>
                          {block.confidence?.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{block.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;