import React, { useState, useEffect, useRef } from 'react';

function ScoreSelector() {
  const [scores, setScores] = useState([]);
  const [selectedScore, setSelectedScore] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);

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

  const renderPage = async (pageNumber) => {
    if (!pdfDocRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const canvas = canvasRef.current;
      const viewport = page.getViewport({ scale: 1.5 });

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

  const handleScoreChange = (event) => {
    const fullPath = `http://localhost:3002${event.target.value}`;
    setSelectedScore(fullPath);
    setCurrentPage(1);
  };

  if (isLoading) return <div>Ładowanie listy utworów...</div>;
  if (error) return <div>Błąd: {error}</div>;

  return (
    <div className="score-selector">
      <h2>Wybierz nuty:</h2>
      <select 
        value={selectedScore ? selectedScore.replace('http://localhost:3002', '') : ''}
        onChange={handleScoreChange}
      >
        <option value="">-- Wybierz utwór --</option>
        {scores.map((score, index) => (
          <option key={index} value={score.path}>
            {score.name}
          </option>
        ))}
      </select>
      
      {selectedScore && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '10px', 
            marginBottom: '10px' 
          }}>
            <button 
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              style={{
                padding: '8px 16px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                backgroundColor: currentPage <= 1 ? '#cccccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              ← Poprzednia strona
            </button>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              Strona {currentPage} z {numPages || '?'}
            </span>
            <button 
              onClick={handleNextPage}
              disabled={currentPage >= (numPages || 1)}
              style={{
                padding: '8px 16px',
                cursor: currentPage >= (numPages || 1) ? 'not-allowed' : 'pointer',
                backgroundColor: currentPage >= (numPages || 1) ? '#cccccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Następna strona →
            </button>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '20px' 
          }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoreSelector;