import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import UploadPage from '../pages/Upload';
import * as api from '../utils/api';

// Mock the API
vi.mock('../utils/api', () => ({
  uploadDocument: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders upload form', () => {
    renderWithRouter(<UploadPage />);
    
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    expect(screen.getByText('Drop your file here, or')).toBeInTheDocument();
    expect(screen.getByText('browse')).toBeInTheDocument();
  });

  test('validates file size', async () => {
    renderWithRouter(<UploadPage />);
    
    const fileInput = screen.getByLabelText(/browse/i);
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('File size must be less than 50MB')).toBeInTheDocument();
    });
  });

  test('validates file type', async () => {
    renderWithRouter(<UploadPage />);
    
    const fileInput = screen.getByLabelText(/browse/i);
    const invalidFile = new File(['content'], 'test.exe', {
      type: 'application/x-executable',
    });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Only PDF, images.*are allowed/)).toBeInTheDocument();
    });
  });

  test('uploads valid file successfully', async () => {
    const mockResponse = { jobId: 'test-job-123', documentId: 'doc-123' };
    api.uploadDocument.mockResolvedValue(mockResponse);

    renderWithRouter(<UploadPage />);
    
    const fileInput = screen.getByLabelText(/browse/i);
    const validFile = new File(['content'], 'test.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const uploadButton = screen.getByText('Upload Document');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(api.uploadDocument).toHaveBeenCalledWith(validFile);
      expect(mockNavigate).toHaveBeenCalledWith('/job/test-job-123');
    });
  });

  test('handles upload error', async () => {
    const mockError = { response: { data: { error: 'Upload failed' } } };
    api.uploadDocument.mockRejectedValue(mockError);

    renderWithRouter(<UploadPage />);
    
    const fileInput = screen.getByLabelText(/browse/i);
    const validFile = new File(['content'], 'test.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const uploadButton = screen.getByText('Upload Document');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });
});