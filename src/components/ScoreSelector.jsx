import React, { useState, useRef, useEffect } from 'react';
import { getDocument } from 'pdfjs-dist';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// Importuj worker bezpośrednio
import 'pdfjs-dist/build/pdf.worker.entry';

function ScoreSelector() {
  const [isFileView, setIsFileView] = useState(true);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  // Pobieranie listy plików
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/scores');
        const data = await response.json();
        
        if (data.files) {
          setFiles(data.files);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Nie udało się pobrać listy plików');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // Obsługa wyboru pliku
  const handleFileSelect = async (file) => {
    try {
      console.log('Loading file:', file);
      setSelectedFile(file);
      setError(null);
      
      const response = await fetch(`/api/scores/${file}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('File loaded, creating PDF document...');
      
      const loadedPdf = await getDocument(arrayBuffer).promise;
      console.log('PDF document created');
      
      setPdfDoc(loadedPdf);
      setNumPages(loadedPdf.numPages);
      setCurrentPage(1);
      setIsFileView(false);
    } catch (error) {
      console.error('PDF loading error:', error);
      setError(`Nie udało się załadować pliku PDF: ${error.message}`);
    }
  };

  // Dodaj useEffect do renderowania strony
  useEffect(() => {
    if (pdfDoc) {
      renderPage();
    }
  }, [pdfDoc, currentPage]);

  // Zaktualizowana funkcja renderowania strony
  const renderPage = async () => {
    try {
      console.log('Renderowanie strony:', currentPage);
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      
      if (!canvas) {
        console.error('Canvas nie został znaleziony');
        return;
      }

      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext('2d');
      
      // Ustaw wymiary canvasu
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      console.log('Wymiary viewport:', viewport.width, viewport.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      console.log('Rozpoczęcie renderowania...');
      await page.render(renderContext).promise;
      console.log('Renderowanie zakończone');
    } catch (error) {
      console.error('Błąd renderowania strony:', error);
      setError('Nie udało się wyrenderować strony PDF');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBackToFiles = () => {
    setIsFileView(true);
    setPdfDoc(null);
    setSelectedFile(null);
    setCurrentPage(1);
    setNumPages(0);
  };

  if (isFileView) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Wybierz nuty</h2>
        
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Ładowanie listy utworów...
          </div>
        )}

        {error && (
          <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {files.map((file, index) => (
            <div
              key={index}
              onClick={() => handleFileSelect(file)}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: 'white',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              {file}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        padding: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #ddd'
      }}>
        <button 
          onClick={handleBackToFiles}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <FaArrowLeft style={{ marginRight: '5px' }} />
          Powrót
        </button>
        
        <div>
          {selectedFile} - Strona {currentPage} z {numPages}
        </div>
        
        <div>
          <button 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              marginRight: '10px'
            }}
          >
            <FaArrowLeft />
          </button>
          
          <button 
            onClick={handleNextPage}
            disabled={currentPage === numPages}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: currentPage === numPages ? 'default' : 'pointer',
              opacity: currentPage === numPages ? 0.5 : 1
            }}
          >
            <FaArrowRight />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        overflow: 'auto'
      }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
          }} 
        />
      </div>
    </div>
  );
}

export default ScoreSelector;