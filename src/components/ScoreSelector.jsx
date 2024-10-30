import React, { useState, useEffect } from 'react';

function ScoreSelector() {
  const [scores, setScores] = useState([]);
  const [selectedScore, setSelectedScore] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/scores');
        if (!response.ok) {
          throw new Error('Problem z pobraniem plików');
        }
        const data = await response.json();
        setScores(data);
      } catch (err) {
        setError(err.message);
        console.error('Błąd:', err);
      }
    };

    fetchScores();
  }, []);

  const handleScoreChange = (event) => {
    setSelectedScore(event.target.value);
  };

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
        <div style={{ marginTop: '20px', width: '100%', height: '800px' }}>
          <iframe
            src={selectedScore}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="PDF Viewer"
          />
        </div>
      )}
    </div>
  );
}

export default ScoreSelector; 