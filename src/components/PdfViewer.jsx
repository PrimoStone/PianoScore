import { useState, useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { useSwipeable } from 'react-swipeable';
import '../styles/PdfViewer.css';

const PdfViewer = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      setScale(0.8);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Szczegóły błędu PDF:', error);
    setError(`Nie udało się załadować pliku PDF: ${error.message}`);
    setLoading(false);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => setPageNumber(prev => Math.min(prev + 1, numPages || 1)),
    onSwipedRight: () => setPageNumber(prev => Math.max(prev - 1, 1)),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div className="pdf-viewer-fullscreen" ref={containerRef} {...handlers}>
      <button className="close-button" onClick={onClose}>
        ✕
      </button>

      {loading && (
        <div className="pdf-loading">
          <div className="loading-spinner"></div>
          <p>Ładowanie PDF...</p>
        </div>
      )}

      {error ? (
        <div className="pdf-error">
          <h3>Błąd</h3>
          <p>{error}</p>
          <button onClick={onClose}>Zamknij</button>
        </div>
      ) : (
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="pdf-loading">
              <div className="loading-spinner"></div>
              <p>Inicjalizacja dokumentu...</p>
            </div>
          }
          options={{
            cMapUrl: 'https://unpkg.com/pdfjs-dist@2.16.105/cmaps/',
            cMapPacked: true,
            disableAutoFetch: true,
            disableStream: true,
          }}
        >
          {numPages > 0 && (
            <Page 
              key={`page_${pageNumber}`}
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              scale={scale}
              loading={
                <div className="page-loading">
                  Ładowanie strony {pageNumber}...
                </div>
              }
            />
          )}
        </Document>
      )}

      {!error && numPages && (
        <div className="pdf-controls">
          <button 
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
          >
            ←
          </button>
          <span>
            {pageNumber} / {numPages}
          </span>
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