import React, { useState, useEffect } from 'react';

function ScoreSelector() {
  const [scores, setScores] = useState([]);
  const [selectedScore, setSelectedScore] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setIsLoading(true);
        console.log('Rozpoczynam pobieranie plików...'); // debugging
        
        const response = await fetch('http://localhost:3002/api/scores', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Odpowiedź z serwera:', response); // debugging

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Otrzymane dane:', data); // debugging
        
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

  const handleScoreChange = (event) => {
    setSelectedScore(event.target.value);
  };

  if (isLoading) {
    return <div>Ładowanie listy utworów...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Błąd podczas ładowania listy utworów: {error}</p>
        <p>Sprawdź czy serwer jest uruchomiony na porcie 3002</p>
      </div>
    );
  }

  return (
    <div className="score-selector">
      <h2>Wybierz nuty:</h2>
      <select 
        value={selectedScore} 
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
          <p>Wybrany utwór: {selectedScore}</p>
          <iframe
            src={selectedScore}
            style={{ width: '100%', height: '800px', border: 'none' }}
            title="PDF Viewer"
          />
        </div>
      )}
    </div>
  );
}

export default ScoreSelector;