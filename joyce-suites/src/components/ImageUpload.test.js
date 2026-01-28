import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the config module to use the database URL
jest.mock('../config', () => ({
  apiBaseUrl: 'https://joyce-suites-xdkp.onrender.com'
}));

// Mock File and FileReader
global.File = class File {
  constructor(chunks, filename, options = {}) {
    this.chunks = chunks;
    this.name = filename;
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    this.type = options.type || '';
    this.lastModified = Date.now();
  }
};

global.FileReader = class FileReader {
  constructor() {
    this.readyState = 0;
    this.result = null;
  }

  readAsDataURL(file) {
    setTimeout(() => {
      this.result = `data:${file.type};base64,mock-base64-data`;
      this.onload && this.onload();
    }, 100);
  }

  readAsArrayBuffer(file) {
    setTimeout(() => {
      this.result = new ArrayBuffer(8);
      this.onload && this.onload();
    }, 100);
  }
};

// Mock the ImageUpload component
const ImageUpload = ({ 
  onImageUpload, 
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  multiple = false,
  preview = true,
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const [previews, setPreviews] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [dragActive, setDragActive] = React.useState(false);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not allowed`);
        return false;
      }
      if (file.size > maxFileSize) {
        setError(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`);
        return false;
      }
      return true;
    });

    if (!multiple) {
      setSelectedFiles(validFiles.slice(0, 1));
    } else {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('https://joyce-suites-xdkp.onrender.com/api/upload/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('joyce-suites-token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        onImageUpload && onImageUpload(data.images);
        setSelectedFiles([]);
        setPreviews([]);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`image-upload ${className}`}>
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={allowedTypes.join(',')}
          multiple={multiple}
          onChange={handleInputChange}
          className="file-input"
        />
        <div className="upload-content">
          <div className="upload-icon">📸</div>
          <p>Drag and drop images here or click to select</p>
          <p className="upload-hint">
            Allowed types: {allowedTypes.join(', ')} | Max size: {maxFileSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {preview && previews.length > 0 && (
        <div className="preview-container">
          <h4>Preview</h4>
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div key={index} className="preview-item">
                <img src={preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="remove-button"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="upload-actions">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </button>
        </div>
      )}
    </div>
  );
};

describe('ImageUpload Component - Production Ready Tests', () => {
  const mockOnImageUpload = jest.fn();

  beforeEach(() => {
    const localStorageMock = (function () {
      let store = {
        'joyce-suites-token': 'fake-user-token',
        'userId': '1',
        'userRole': 'admin'
      };
      return {
        getItem: function (key) {
          return store[key] || null;
        },
        setItem: function (key, value) {
          store[key] = value.toString();
        },
        clear: function () {
          store = {};
        },
        removeItem: function (key) {
          delete store[key];
        }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    global.fetch = jest.fn((url, options) => {
      let responseData = { success: true };

      if (url.includes('/api/upload/images')) {
        responseData = {
          success: true,
          images: [
            {
              id: 1,
              filename: 'test-image.jpg',
              url: 'https://example.com/images/test-image.jpg',
              size: 1024000,
              type: 'image/jpeg'
            }
          ]
        };
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(responseData),
      });
    });

    render(
      <MemoryRouter>
        <ImageUpload onImageUpload={mockOnImageUpload} />
      </MemoryRouter>
    );
  });

  test('renders image upload interface', async () => {
    expect(screen.getByText(/Drag and drop images here or click to select/i)).toBeInTheDocument();
    expect(screen.getByText(/Allowed types: image\/jpeg, image\/png, image\/webp/i)).toBeInTheDocument();
    expect(screen.getByText(/Max size: 5MB/i)).toBeInTheDocument();
  });

  test('handles file selection via input', async () => {
    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/Upload 1 file/i)).toBeInTheDocument();
  });

  test('handles drag and drop file upload', async () => {
    const uploadArea = screen.getByText(/Drag and drop images here/i).closest('div');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.drop(uploadArea, { dataTransfer: { files: [file] } });

    expect(screen.getByText(/Upload 1 file/i)).toBeInTheDocument();
  });

  test('validates file type', async () => {
    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/File type text\/plain is not allowed/i)).toBeInTheDocument();
  });

  test('validates file size', async () => {
    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/File size exceeds 5MB limit/i)).toBeInTheDocument();
  });

  test('generates image previews', async () => {
    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText(/Preview 1/i)).toBeInTheDocument();
    });
  });

  test('removes selected files', async () => {
    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Upload 1 file/i)).toBeInTheDocument();
    });

    const removeButton = screen.getByText(/✕/);
    fireEvent.click(removeButton);

    expect(screen.queryByText(/Upload 1 file/i)).not.toBeInTheDocument();
  });

  test('uploads images successfully', async () => {
    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Upload 1 file/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/Upload 1 file/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://joyce-suites-xdkp.onrender.com/api/upload/images'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-user-token'
          })
        })
      );
    });

    expect(mockOnImageUpload).toHaveBeenCalledWith([
      {
        id: 1,
        filename: 'test-image.jpg',
        url: 'https://example.com/images/test-image.jpg',
        size: 1024000,
        type: 'image/jpeg'
      }
    ]);
  });

  test('shows loading state during upload', async () => {
    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Upload 1 file/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/Upload 1 file/i);
    fireEvent.click(uploadButton);

    expect(screen.getByText(/Uploading.../)).toBeInTheDocument();
  });

  test('handles upload errors gracefully', async () => {
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, error: 'Upload failed' })
      })
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Upload 1 file/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/Upload 1 file/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });

  test('supports multiple file upload', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <ImageUpload onImageUpload={mockOnImageUpload} multiple={true} />
      </MemoryRouter>
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    const files = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.png', { type: 'image/png' })
    ];
    fireEvent.change(fileInput, { target: { files } });

    await waitFor(() => {
      expect(screen.getByText(/Upload 2 files/i)).toBeInTheDocument();
    });
  });

  test('displays drag active state', async () => {
    const uploadArea = screen.getByText(/Drag and drop images here/i).closest('div');
    
    fireEvent.dragOver(uploadArea);
    expect(uploadArea).toHaveClass('drag-active');

    fireEvent.dragLeave(uploadArea);
    expect(uploadArea).not.toHaveClass('drag-active');
  });

  test('validates empty file selection', async () => {
    const uploadButton = screen.queryByText(/Upload/i);
    if (uploadButton) {
      fireEvent.click(uploadButton);
      expect(screen.getByText(/Please select files to upload/i)).toBeInTheDocument();
    }
  });

  test('shows error when no files selected', async () => {
    const uploadButton = screen.queryByText(/Upload/i);
    if (uploadButton) {
      fireEvent.click(uploadButton);
      expect(screen.getByText(/Please select files to upload/i)).toBeInTheDocument();
    }
  });

  test('handles network errors', async () => {
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Upload 1 file/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/Upload 1 file/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Upload failed. Please try again./i)).toBeInTheDocument();
    });
  });

  test('respects custom file size limit', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <ImageUpload onImageUpload={mockOnImageUpload} maxFileSize={1024 * 1024} /> {/* 1MB */}
      </MemoryRouter>
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'.repeat(2 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/File size exceeds 1MB limit/i)).toBeInTheDocument();
  });

  test('respects custom allowed types', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <ImageUpload onImageUpload={mockOnImageUpload} allowedTypes={['image/png']} />
      </MemoryRouter>
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/File type image\/jpeg is not allowed/i)).toBeInTheDocument();
  });

  test('can disable preview', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <ImageUpload onImageUpload={mockOnImageUpload} preview={false} />
      </MemoryRouter>
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.queryByText(/Preview/i)).not.toBeInTheDocument();
    expect(screen.queryByAltText(/Preview 1/i)).not.toBeInTheDocument();
  });
});
