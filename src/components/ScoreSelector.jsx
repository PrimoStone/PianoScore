import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function ScoreSelector({ onViewChange }) {
  const [isFileView, setIsFileView] = useState(true);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching scores...');
        
        const response = await fetch('/api/scores');
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Received data:', data);

        if (data.files) {
          setFiles(data.files);
        } else {
          throw new Error('Nieprawidłowy format danych');
        }
      } catch (err) {
        console.error('Błąd pobierania plików:', err);
        setError('Nie udało się załadować listy plików');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, []);

  useEffect(() => {
    if (pdfDoc) {
      renderPage();
    }
  }, [pdfDoc, currentPage]);

  const handleFileSelect = async (file) => {
    try {
      const response = await fetch(`/api/scores/${file}`);
      const arrayBuffer = await response.arrayBuffer();
      const loadedPdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      setPdfDoc(loadedPdf);
      setNumPages(loadedPdf.numPages);
      setCurrentPage(1);
      setIsFileView(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const renderPage = async () => {
    try {
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Błąd renderowania strony:', err);
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
    setCurrentPage(1);
    setNumPages(0);
  };

  return (
    <div>
      {isFileView ? (
        <div style={{ padding: '20px' }}>
          <h2>Wybierz nuty</h2>
          
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Ładowanie listy utworów...
            </div>
          )}

          {error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: 'red' 
            }}>
              {error}
            </div>
          )}

          {!isLoading && !error && (
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
                    backgroundColor: 'white'
                  }}
                >
                  {file}
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && files.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Brak plików do wyświetlenia
            </div>
          )}
        </div>
      ) : (
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
              Powrót
            </button>
            <div>
              Strona {currentPage} z {numPages}
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
                Poprzednia
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
                Następna
              </button>
            </div>
          </div>
          <div style={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}>
            <canvas 
              ref={canvasRef} 
              style={{ 
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain'
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoreSelector;