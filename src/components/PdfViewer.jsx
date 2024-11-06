import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '../styles/PdfViewer.css';

const PdfViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Nie udało się załadować pliku PDF. Sprawdź czy plik nie jest uszkodzony.');
    setLoading(false);
  };

  return (
    <div className="pdf-viewer">
      {loading && <div className="pdf-loading">Ładowanie PDF...</div>}
      {error && <div className="pdf-error">{error}</div>}
      
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div className="pdf-loading">Ładowanie PDF...</div>}
      >
        {!error && (
          <>
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              scale={1.2}
            />
            
            <div className="pdf-controls">
              <button 
                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
              >
                Poprzednia
              </button>
              
              <span className="pdf-page-info">
                Strona {pageNumber} z {numPages || '?'}
              </span>
              
              <button 
                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
                disabled={pageNumber >= numPages}
              >
                Następna
              </button>
            </div>
          </>
        )}
      </Document>
    </div>
  );
};

export default PdfViewer; 