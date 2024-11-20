import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSwipeable } from 'react-swipeable';
import GestureRecognition from './GestureRecognition';
import '../styles/PdfViewer.css';

const PdfViewer = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gesturesEnabled, setGesturesEnabled] = useState(false);
  const containerRef = useRef(null);
  const pageChangeTimeoutRef = useRef(null);

  const handlers = useSwipeable({
    onSwipedLeft: () => handlePageChange(1),
    onSwipedRight: () => handlePageChange(-1),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  useEffect(() => {
    // Reset state when file changes
    setPageNumber(1);
    setLoading(true);
    setError(null);
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const handlePageChange = (delta) => {
    setPageNumber(prevPage => {
      const newPage = prevPage + delta;
      // Ensure the new page number is within bounds
      if (newPage >= 1 && newPage <= numPages) {
        return newPage;
      }
      return prevPage;
    });
  };

  const handleGesture = (gesture) => {
    if (!gesturesEnabled) return;

    // Clear any existing timeout
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current);
    }

    // Set a new timeout to handle the gesture
    pageChangeTimeoutRef.current = setTimeout(() => {
      switch (gesture) {
        case 'NEXT_PAGE':
          if (pageNumber < numPages) {
            handlePageChange(1);
          }
          break;
        case 'PREVIOUS_PAGE':
          if (pageNumber > 1) {
            handlePageChange(-1);
          }
          break;
        default:
          break;
      }
    }, 100); // Small delay to prevent rapid changes
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="pdf-viewer-fullscreen" 
      ref={containerRef}
      {...handlers}
    >
      <button className="close-button" onClick={onClose}>✕</button>
      <button 
        className="gesture-toggle"
        onClick={() => setGesturesEnabled(!gesturesEnabled)}
      >
        {gesturesEnabled ? '🎥 Disable Gestures' : '🎥 Enable Gestures'}
      </button>

      {loading && (
        <div className="pdf-loading">
          <div className="loading-spinner"></div>
          <p>Loading PDF...</p>
        </div>
      )}

      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => {
          console.error('PDF load error:', error);
          setError('Failed to load PDF file');
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
            onClick={() => handlePageChange(-1)}
            disabled={pageNumber <= 1}
          >
            ←
          </button>
          <span>{pageNumber} / {numPages}</span>
          <button 
            onClick={() => handlePageChange(1)}
            disabled={pageNumber >= numPages}
          >
            →
          </button>
        </div>
      )}

      {gesturesEnabled && (
        <GestureRecognition 
          onGesture={handleGesture} 
          enabled={gesturesEnabled} 
        />
      )}
    </div>
  );
};

export default PdfViewer;