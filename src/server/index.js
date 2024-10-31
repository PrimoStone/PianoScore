import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Dodaj middleware do serwowania statycznych plików
app.use('/scores', express.static(path.join(__dirname, '../../public/scores')));

app.get('/api/scores', async (req, res) => {
  try {
    const scoresDir = path.join(__dirname, '../../public/scores');
    console.log('Sprawdzam folder:', scoresDir); // debugging

    const files = await fs.readdir(scoresDir);
    console.log('Znalezione pliki:', files); // debugging

    const scores = files
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        name: file,
        path: `http://localhost:3002/scores/${file}` // Pełny URL
      }));

    console.log('Wysyłam dane:', scores); // debugging
    res.json(scores);
  } catch (error) {
    console.error('Błąd podczas odczytywania folderu scores:', error);
    res.status(500).json({ 
      error: 'Nie udało się pobrać listy utworów',
      details: error.message 
    });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Serwer API działa na porcie ${PORT}`);
}); 