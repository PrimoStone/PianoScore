import { Document, Page } from 'react-pdf';
import { useState } from 'react';

const PdfViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="pdf-viewer">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page 
          pageNumber={pageNumber} 
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      <div className="pdf-controls">
        <button 
          disabled={pageNumber <= 1} 
          onClick={() => setPageNumber(prev => prev - 1)}
        >
          Poprzednia
        </button>
        <span>
          Strona {pageNumber} z {numPages}
        </span>
        <button 
          disabled={pageNumber >= numPages} 
          onClick={() => setPageNumber(prev => prev + 1)}
        >
          Następna
        </button>
      </div>
    </div>
  );
};

export default PdfViewer; 