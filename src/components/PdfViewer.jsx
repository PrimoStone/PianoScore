import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSwipeable } from 'react-swipeable';
import '../styles/PdfViewer.css';

const PdfViewer = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (pageNumber < numPages) {
        setPageNumber(prev => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (pageNumber > 1) {
        setPageNumber(prev => prev - 1);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  useEffect(() => {
    // Reset stanu przy zmianie pliku
    setPageNumber(1);
    setLoading(true);
    setError(null);
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  return (
    <div 
      className="pdf-viewer-fullscreen" 
      ref={containerRef}
      {...handlers}
    >
      <button className="close-button" onClick={onClose}>✕</button>

      {loading && (
        <div className="pdf-loading">
          <div className="loading-spinner"></div>
          <p>Ładowanie PDF...</p>
        </div>
      )}

      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => {
          console.error('PDF load error:', error);
          setError('Nie udało się załadować pliku PDF');
          setLoading(false);
        }}
        options={{
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/'
        }}
      >
        {numPages > 0 && (
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        )}
      </Document>

      {!error && numPages > 0 && (
        <div className="pdf-controls">
          <button 
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
          >
            ←
          </button>
          <span>{pageNumber} / {numPages}</span>
          <button 
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
            disabled={pageNumber >= numPages}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;