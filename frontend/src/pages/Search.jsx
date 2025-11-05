import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter, FileText, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchDocuments } from '../utils/api';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    fileType: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q, currentPage);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery, page = 1) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const data = await searchDocuments(searchQuery, page, 10);
      setResults(data.results);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchParams({ q: query, page: '1' });
  };

  const handlePageChange = (page) => {
    setSearchParams({ q: query, page: page.toString() });
  };

  const openDocument = (documentId, pageNumber = 1) => {
    navigate(`/document/${documentId}?page=${pageNumber}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileTypeIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('image')) return '🖼️';
    return '📝';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Documents</h1>
        
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents..."
                className="input pl-10"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </div>
        </form>

        {showFilters && (
          <div className="card mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Type
                </label>
                <select
                  value={filters.fileType}
                  onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value }))}
                  className="input"
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="image">Images</option>
                  <option value="text">Text</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Found {pagination.total} results for "{query}"
          </div>

          <div className="space-y-4 mb-8">
            {results.map((result, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => openDocument(result.documentId, result.pageNumber)}>
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{getFileTypeIcon(result.mimeType)}</span>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                        {result.documentName}
                      </h3>
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        Page {result.pageNumber}
                      </span>
                    </div>
                    
                    <div 
                      className="text-gray-700 mb-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: result.snippet }}
                    />
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      {result.confidence && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.confidence > 90 ? 'bg-green-100 text-green-700' :
                          result.confidence > 70 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {result.confidence.toFixed(1)}% confidence
                        </span>
                      )}
                      {result.score && (
                        <span>Relevance: {result.score.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-16 h-20 bg-gray-100 rounded border flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg font-medium ${
                      page === currentPage
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;