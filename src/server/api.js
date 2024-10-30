const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

router.get('/api/scores', async (req, res) => {
  try {
    const scoresDir = path.join(__dirname, '../../public/scores');
    const files = await fs.readdir(scoresDir);
    
    const scores = files
      .filter(file => file.endsWith('.pdf') || file.endsWith('.musicxml'))
      .map(file => ({
        name: file,
        path: `/scores/${file}`
      }));

    res.json(scores);
  } catch (error) {
    console.error('Błąd podczas odczytywania folderu scores:', error);
    res.status(500).json({ error: 'Nie udało się pobrać listy utworów' });
  }
});

module.exports = router; 