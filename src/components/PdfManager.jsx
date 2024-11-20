import { useState, useEffect } from 'react';
import FolderManager from '../utils/folderAccess';
import PdfViewer from './PdfViewer';
import '../styles/PdfManager.css';

const PdfManager = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const folderManager = new FolderManager();

  const handleSelectFolder = async () => {
    try {
      const handle = await folderManager.selectDirectory();
      const files = await folderManager.listPdfFiles(handle);
      console.log('Selected files:', files); // Debug log
      setPdfFiles(files);
      setSelectedPdf(null); // Reset selection when changing files
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting files:', error);
      }
    }
  };

  const handlePdfSelect = async (event) => {
    const selectedFile = pdfFiles.find(pdf => pdf.name === event.target.value);
    if (selectedFile) {
      try {
        if (selectedPdf?.url) {
          URL.revokeObjectURL(selectedPdf.url);
        }

        const file = await selectedFile.handle.getFile();
        
        if (!file.type.includes('pdf')) {
          throw new Error('Selected file is not a PDF');
        }

        console.log('File size:', file.size, 'bytes');
        
        const url = URL.createObjectURL(file);
        console.log('Created URL:', url);

        setSelectedPdf({
          ...selectedFile,
          url: url,
          type: file.type
        });
      } catch (error) {
        console.error('Error details:', error);
        alert(`Failed to open file: ${error.message}`);
        setSelectedPdf(null);
      }
    }
  };

  const handleCloseViewer = () => {
    if (selectedPdf?.url) {
      URL.revokeObjectURL(selectedPdf.url);
    }
    setSelectedPdf(null);
  };

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      if (selectedPdf?.url) {
        URL.revokeObjectURL(selectedPdf.url);
      }
    };
  }, []);

  return (
    <div className="pdf-manager">
      <div className="controls-section">
        <button 
          className="folder-button"
          onClick={handleSelectFolder}
        >
          Select PDF Files
        </button>
        
        {pdfFiles.length > 0 && (
          <div className="folder-info">
            <select 
              className="pdf-select"
              value={selectedPdf?.name || ''}
              onChange={handlePdfSelect}
            >
              <option value="">Select a PDF file</option>
              {pdfFiles.map((pdf) => (
                <option key={pdf.name} value={pdf.name}>
                  {pdf.name} ({(pdf.size / 1024 / 1024).toFixed(2)} MB)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedPdf?.url ? (
        <PdfViewer 
          file={selectedPdf.url} 
          onClose={handleCloseViewer}
        />
      ) : (
        <div className="no-pdf-selected">
          {pdfFiles.length > 0 
            ? 'Select a PDF file from the list'
            : 'Select PDF files to view'}
        </div>
      )}
    </div>
  );
};

export default PdfManager;