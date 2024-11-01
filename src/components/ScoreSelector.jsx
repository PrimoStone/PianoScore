import React, { useState, useEffect, useRef } from 'react';

function ScoreSelector({ onViewChange }) {
  const [scores, setScores] = useState([]);
  const [selectedScore, setSelectedScore] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const [scale, setScale] = useState(1.5);
  const [isFileView, setIsFileView] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef(null);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(numPages || 1, prev + 1));
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3002/api/scores', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setScores(data);
      } catch (err) {
        console.error('Szczegóły błędu:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, []);

  const loadPDF = async (url) => {
    try {
      const loadingTask = window.pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      renderPage(1);
    } catch (err) {
      console.error('Błąd ładowania PDF:', err);
      setError(err.message);
    }
  };

  const calculateOptimalScale = (page) => {
    const viewport = page.getViewport({ scale: 1.0 });
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const scaleHeight = (viewportHeight - 80) / viewport.height;
    const scaleWidth = (viewportWidth - 120) / viewport.width;
    
    return Math.min(scaleHeight, scaleWidth);
  };

  const renderPage = async (pageNumber) => {
    if (!pdfDocRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const canvas = canvasRef.current;
      
      const optimalScale = calculateOptimalScale(page);
      setScale(optimalScale);
      
      const viewport = page.getViewport({ scale: optimalScale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Błąd renderowania strony:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (pdfDocRef.current) {
        if (e.key === 'ArrowRight' && currentPage < numPages) {
          setCurrentPage(prev => prev + 1);
        } else if (e.key === 'ArrowLeft' && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, numPages]);

  useEffect(() => {
    if (selectedScore) {
      loadPDF(selectedScore);
    }
  }, [selectedScore]);

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleResize = () => {
      if (pdfDocRef.current) {
        renderPage(currentPage);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentPage]);

  const handleScoreChange = (event) => {
    const fullPath = `http://localhost:3002${event.target.value}`;
    setSelectedScore(fullPath);
    setCurrentPage(1);
    setIsFileView(false);
    onViewChange(false);
  };

  const handleBackClick = () => {
    setIsFileView(true);
    onViewChange(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isLoading) return <div>Ładowanie listy utworów...</div>;
  if (error) return <div>Błąd: {error}</div>;

  return (
    <div className="score-selector" style={{ height: '100vh', margin: 0, padding: 0 }}>
      {isFileView ? (
        <div style={{ padding: '20px' }}>
          <h2>Wybierz nuty:</h2>
          <select 
            value={selectedScore ? selectedScore.replace('http://localhost:3002', '') : ''}
            onChange={handleScoreChange}
            style={{ width: '100%', padding: '10px', marginTop: '10px' }}
          >
            <option value="">-- Wybierz utwór --</option>
            {scores.map((score, index) => (
              <option key={index} value={score.path}>
                {score.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div 
          ref={fullscreenRef}
          style={{ 
            height: '100vh',
            width: '100vw',
            position: 'relative',
            backgroundColor: '#000',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={toggleFullscreen}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              padding: '10px',
              backgroundColor: 'rgba(76, 175, 80, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? '↙' : '↗'}
          </button>

          <button
            onClick={handleBackClick}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              zIndex: 1000,
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>←</span>
            <span>Powrót</span>
          </button>

          <button 
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            style={{
              position: 'fixed',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1000,
              padding: '15px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              backgroundColor: currentPage <= 1 ? 'rgba(204, 204, 204, 0.7)' : 'rgba(76, 175, 80, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s'
            }}
          >
            ←
          </button>

          <button 
            onClick={handleNextPage}
            disabled={currentPage >= (numPages || 1)}
            style={{
              position: 'fixed',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1000,
              padding: '15px',
              cursor: currentPage >= (numPages || 1) ? 'not-allowed' : 'pointer',
              backgroundColor: currentPage >= (numPages || 1) ? 'rgba(204, 204, 204, 0.7)' : 'rgba(76, 175, 80, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s'
            }}
          >
            →
          </button>

          <div style={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}>
            <canvas ref={canvasRef} style={{ maxHeight: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoreSelector;