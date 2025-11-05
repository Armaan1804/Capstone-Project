import { useState } from 'react';
import { Upload, Search, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const ComponentShowcase = () => {
  const [activeTab, setActiveTab] = useState('buttons');

  const tabs = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'forms', label: 'Forms' },
    { id: 'status', label: 'Status' },
    { id: 'search', label: 'Search' },
  ];

  const ButtonExamples = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Primary Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">Upload Document</button>
          <button className="btn-primary" disabled>Uploading...</button>
          <button className="btn-primary flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Upload with Icon
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Secondary Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-secondary">Cancel</button>
          <button className="btn-secondary flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
        </div>
      </div>
    </div>
  );

  const CardExamples = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium mb-2">Basic Card</h3>
        <p className="text-gray-600">This is a basic card component with default styling.</p>
      </div>
      
      <div className="card">
        <div className="flex items-center mb-4">
          <FileText className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium">Document Card</h3>
            <p className="text-sm text-gray-500">Sample document.pdf</p>
          </div>
        </div>
        <p className="text-gray-600">Document preview with icon and metadata.</p>
      </div>
    </div>
  );

  const FormExamples = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Input
        </label>
        <input
          type="text"
          placeholder="Search documents..."
          className="input"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File Upload
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-600">Drop files here or click to browse</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Dropdown
        </label>
        <select className="input">
          <option>All File Types</option>
          <option>PDF</option>
          <option>Images</option>
          <option>Text</option>
        </select>
      </div>
    </div>
  );

  const StatusExamples = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Status Badges</h3>
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed
          </span>
          <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Clock className="h-4 w-4 mr-1" />
            Processing
          </span>
          <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            <XCircle className="h-4 w-4 mr-1" />
            Failed
          </span>
          <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Low Confidence
          </span>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Progress Bar</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Processing: 7 of 10 pages</span>
            <span>70%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    </div>
  );

  const SearchExamples = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📄</span>
              <h3 className="text-lg font-medium text-gray-900">Research Paper.pdf</h3>
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                Page 2
              </span>
            </div>
            
            <div className="text-gray-700 mb-3 leading-relaxed">
              This document explores the latest developments in <mark>artificial intelligence</mark> and <mark>machine learning</mark> technologies...
            </div>
            
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                95.2% confidence
              </span>
              <span>Relevance: 1.85</span>
            </div>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <div className="w-16 h-20 bg-gray-100 rounded border flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'buttons': return <ButtonExamples />;
      case 'cards': return <CardExamples />;
      case 'forms': return <FormExamples />;
      case 'status': return <StatusExamples />;
      case 'search': return <SearchExamples />;
      default: return <ButtonExamples />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Component Showcase</h1>
        <p className="text-gray-600">Interactive examples of UI components used in the application</p>
      </div>

      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {renderContent()}
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-700">
{`// Button usage
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>

// Card usage
<div className="card">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>

// Input usage
<input className="input" placeholder="Enter text..." />

// Status badge usage
<span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
  Status
</span>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase;