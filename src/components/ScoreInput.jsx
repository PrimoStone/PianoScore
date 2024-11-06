import { useState } from 'react';

const ScoreInput = ({ pdfName, currentScore, onScoreSave }) => {
  const [score, setScore] = useState(currentScore || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numScore = parseInt(score);
    if (numScore >= 0 && numScore <= 100) {
      onScoreSave(pdfName, numScore);
    } else {
      alert('Wynik musi być między 0 a 100');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="score-input">
      <input
        type="number"
        min="0"
        max="100"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Wpisz wynik (0-100)"
      />
      <button type="submit">Zapisz wynik</button>
    </form>
  );
}; 