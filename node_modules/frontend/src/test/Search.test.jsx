import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import SearchPage from '../pages/Search';
import * as api from '../utils/api';

// Mock the API
vi.mock('../utils/api', () => ({
  searchDocuments: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
  });

  test('renders search form', () => {
    renderWithRouter(<SearchPage />);
    
    expect(screen.getByText('Search Documents')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('performs search on form submit', async () => {
    const mockResults = {
      results: [
        {
          documentId: 'doc-1',
          documentName: 'Test Document',
          pageNumber: 1,
          snippet: 'This is a <mark>test</mark> snippet',
          confidence: 95.5,
          score: 1.2,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    };

    api.searchDocuments.mockResolvedValue(mockResults);

    renderWithRouter(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search documents...');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(api.searchDocuments).toHaveBeenCalledWith('test query', 1, 10);
      expect(mockSetSearchParams).toHaveBeenCalledWith({ q: 'test query', page: '1' });
    });
  });

  test('displays search results', async () => {
    const mockResults = {
      results: [
        {
          documentId: 'doc-1',
          documentName: 'Test Document.pdf',
          pageNumber: 1,
          snippet: 'This is a <mark>test</mark> snippet with highlighted terms',
          confidence: 95.5,
          score: 1.2,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    };

    api.searchDocuments.mockResolvedValue(mockResults);

    // Set up search params to trigger search
    mockSearchParams.set('q', 'test');
    
    renderWithRouter(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
      expect(screen.getByText('Page 1')).toBeInTheDocument();
      expect(screen.getByText('95.5% confidence')).toBeInTheDocument();
    });
  });

  test('shows no results message', async () => {
    const mockResults = {
      results: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    };

    api.searchDocuments.mockResolvedValue(mockResults);

    // Set up search params to trigger search
    mockSearchParams.set('q', 'nonexistent');
    
    renderWithRouter(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms or filters.')).toBeInTheDocument();
    });
  });

  test('handles search error', async () => {
    const mockError = new Error('Search failed');
    api.searchDocuments.mockRejectedValue(mockError);

    // Set up search params to trigger search
    mockSearchParams.set('q', 'test');
    
    renderWithRouter(<SearchPage />);

    await waitFor(() => {
      // Should show no results when search fails
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  test('toggles filters panel', () => {
    renderWithRouter(<SearchPage />);
    
    const filtersButton = screen.getByText('Filters');
    
    // Filters should not be visible initially
    expect(screen.queryByText('Date From')).not.toBeInTheDocument();
    
    // Click to show filters
    fireEvent.click(filtersButton);
    expect(screen.getByText('Date From')).toBeInTheDocument();
    expect(screen.getByText('Date To')).toBeInTheDocument();
    expect(screen.getByText('File Type')).toBeInTheDocument();
  });
});