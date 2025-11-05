import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { getJobStatus, getDocumentPages, reprocessDocument } from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';

const JobStatus = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState({});
  const { jobProgress, jobStatus } = useWebSocket(jobId);

  useEffect(() => {
    fetchJobStatus();
  }, [jobId]);

  useEffect(() => {
    if (jobProgress) {
      setJob(prev => prev ? { ...prev, ...jobProgress } : null);
    }
  }, [jobProgress]);

  useEffect(() => {
    if (jobStatus === 'completed') {
      fetchJobStatus();
      fetchPages();
    }
  }, [jobStatus]);

  const fetchJobStatus = async () => {
    try {
      const data = await getJobStatus(jobId);
      if (data) {
        setJob(data);
        if (data.status === 'completed') {
          fetchPages();
        }
      }
    } catch (error) {
      console.error('Failed to fetch job status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    if (!job?.documentId) return;
    
    try {
      const data = await getDocumentPages(job.documentId);
      setPages(data.pages);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    }
  };

  const handleReprocess = async (pageId, options = {}) => {
    setReprocessing(prev => ({ ...prev, [pageId]: true }));
    
    try {
      await reprocessDocument(job.documentId, {
        language: 'eng',
        preprocess: { binarize: true, threshold: 150 },
        ...options
      });
      
      // Refresh job status after reprocessing
      setTimeout(fetchJobStatus, 1000);
    } catch (error) {
      console.error('Reprocessing failed:', error);
    } finally {
      setReprocessing(prev => ({ ...prev, [pageId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'active':
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'active':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-600">The job ID you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Status</h1>
        <p className="text-gray-600">Job ID: {jobId}</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {getStatusIcon(job.status)}
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>
          {job.status === 'completed' && (
            <Link
              to={`/search?documentId=${job.documentId}`}
              className="btn-primary"
            >
              View Document
            </Link>
          )}
        </div>

        {job.totalPages > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {job.processedPages || 0} of {job.totalPages} pages</span>
              <span>{job.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${job.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        {job.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{job.error}</p>
            </div>
          </div>
        )}
      </div>

      {pages.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pages</h2>
          <div className="space-y-4">
            {pages.map((page) => (
              <div key={page._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">Page {page.pageNumber}</span>
                    {getStatusIcon(page.status)}
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(page.status)}`}>
                      {page.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {page.confidence && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        page.confidence > 90 ? 'bg-green-100 text-green-800' :
                        page.confidence > 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {page.confidence.toFixed(1)}% confidence
                      </span>
                    )}
                    {page.confidence < 80 && (
                      <button
                        onClick={() => handleReprocess(page._id)}
                        disabled={reprocessing[page._id]}
                        className="btn-secondary text-xs"
                      >
                        {reprocessing[page._id] ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          'Reprocess'
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                {page.confidence < 80 && (
                  <div className="flex items-center text-sm text-amber-600 mb-2">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Low confidence - consider reprocessing
                  </div>
                )}
                
                {page.text && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <p className="line-clamp-3">{page.text.substring(0, 200)}...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobStatus;