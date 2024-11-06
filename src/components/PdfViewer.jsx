import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSwipeable } from 'react-swipeable';
import '../styles/PdfViewer.css';

console.log('PDF.js version:', pdfjs.version);
console.log('Worker src:', pdfjs.GlobalWorkerOptions.workerSrc);

const PdfViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    console.log('Próba załadowania pliku:', file);
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('PDF załadowany pomyślnie, liczba stron:', numPages);
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Szczegóły błędu ładowania PDF:', error);
    setError(`Nie udało się załadować pliku PDF: ${error.message}`);
    setLoading(false);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => setPageNumber(prev => Math.min(prev + 1, numPages || 1)),
    onSwipedRight: () => setPageNumber(prev => Math.max(prev - 1, 1)),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  if (error) {
    return (
      <div className="pdf-viewer-fullscreen">
        <div className="pdf-error">
          <h3>Błąd ładowania PDF</h3>
          <p>{error}</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-fullscreen" ref={containerRef} {...handlers}>
      {loading && (
        <div className="pdf-loading">
          <div className="loading-spinner"></div>
          <p>Ładowanie PDF...</p>
        </div>
      )}
      
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
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
          cMapPacked: true,
        }}
      >
        {numPages > 0 && (
          <Page 
            key={`page_${pageNumber}`}
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            scale={1.2}
            loading={
              <div className="page-loading">
                Ładowanie strony {pageNumber}...
              </div>
            }
          />
        )}
      </Document>

      {numPages > 0 && (
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