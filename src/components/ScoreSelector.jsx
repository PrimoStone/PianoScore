import React, { useState, useRef, useEffect } from 'react';
import { getDocument } from 'pdfjs-dist';
import { FaArrowLeft, FaArrowRight, FaExpand, FaCompress } from 'react-icons/fa';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const containerRef = useRef(null);

  // Obsługa klawiszy
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!pdfDoc) return;

      switch (event.key) {
        case 'ArrowLeft':
          handlePrevPage();
          break;
        case 'ArrowRight':
          handleNextPage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, numPages]);

  // Obsługa kliknięć w brzegi ekranu
  const handleContainerClick = (event) => {
    if (event.pointerType === 'touch') return;
    
    if (!pdfDoc) return;

    const container = containerRef.current;
    const clickX = event.clientX;
    const containerWidth = container.offsetWidth;
    const clickZone = containerWidth * 0.2;

    if (clickX < clickZone) {
      handlePrevPage();
    } else if (clickX > containerWidth - clickZone) {
      handleNextPage();
    }
  };

  // Obsługa swipe z logowaniem
  const handleTouchStart = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setTouchStartX(x);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX) return;
    
    const touchEndX = e.touches ? e.changedTouches[0].clientX : e.clientX;
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
    
    setTouchStartX(null);
  };

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

  // Renderowanie PDF
  useEffect(() => {
    if (pdfDoc) {
      renderPage();
    }
  }, [pdfDoc, currentPage]);

  const renderPage = async () => {
    try {
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      
      if (!canvas) return;

      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Dodaj w komponencie
  const NavigationHint = ({ side }) => (
    <div style={{
      position: 'absolute',
      top: '50%',
      [side]: '20px',
      transform: 'translateY(-50%)',
      color: 'rgba(0,0,0,0.3)',
      fontSize: '24px',
      opacity: 0,
      transition: 'opacity 0.3s',
      pointerEvents: 'none'
    }}>
      {side === 'left' ? <FaArrowLeft /> : <FaArrowRight />}
    </div>
  );

  // Najprostszy możliwy handler
  const handleTouch = () => {
    console.log('DOTKNIĘTO EKRANU!');
  };

  // Widok PDF
  if (!isFileView) {
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isFullscreen ? 'rgba(0,0,0,0.9)' : 'white',
        display: 'flex',
        flexDirection: 'column',
        zIndex: isFullscreen ? 1000 : 1
      }}>
        <div style={{ 
          padding: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #ddd',
          backgroundColor: isFullscreen ? 'rgba(0,0,0,0.8)' : 'white',
          color: isFullscreen ? 'white' : 'black'
        }}>
          <button onClick={handleBackToFiles}>
            <FaArrowLeft /> Powrót
          </button>
          
          <div>
            {selectedFile} - Strona {currentPage} z {numPages}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              <FaArrowLeft />
            </button>
            <button onClick={toggleFullscreen}>
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            <button onClick={handleNextPage} disabled={currentPage === numPages}>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div 
          ref={containerRef}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          style={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            overflow: 'auto',
            backgroundColor: isFullscreen ? 'rgba(0,0,0,0.9)' : 'white',
            position: 'relative'
          }}
        >
          <canvas 
            ref={canvasRef} 
            style={{ 
              maxWidth: '100%',
              maxHeight: isFullscreen ? '95vh' : '80vh',
              height: 'auto',
              boxShadow: isFullscreen ? 'none' : '0 0 10px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }} 
          />
        </div>
      </div>
    );
  }

  // Zmodyfikowany widok listy plików
  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Wybierz nuty
      </h2>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Ładowanie listy utworów...
        </div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      ) : (
        <select
          value={selectedFile || ''}
          onChange={(e) => handleFileSelect(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="">-- Wybierz utwór --</option>
          {files.map((file, index) => (
            <option key={index} value={file}>
              {file.replace('.pdf', '')}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default ScoreSelector;