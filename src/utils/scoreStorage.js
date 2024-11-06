const saveScore = (pdfName, score) => {
  const scores = JSON.parse(localStorage.getItem('scores') || '{}');
  scores[pdfName] = score;
  localStorage.setItem('scores', JSON.stringify(scores));
};

const getScore = (pdfName) => {
  const scores = JSON.parse(localStorage.getItem('scores') || '{}');
  return scores[pdfName] || null;
}; 