import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

app.get('/api/scores', async (req, res) => {
  try {
    const scoresDir = path.join(__dirname, '../../public/scores');
    console.log('Ścieżka do folderu scores:', scoresDir);
    
    const files = await fs.readdir(scoresDir);
    console.log('Znalezione pliki:', files);
    
    const scores = files
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        name: file,
        path: `/scores/${file}`
      }));
    
    console.log('Wysyłane dane:', scores);
    
    res.json(scores);
  } catch (error) {
    console.error('Błąd podczas odczytywania folderu scores:', error);
    res.status(500).json({ error: 'Nie udało się pobrać listy utworów' });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Serwer API działa na porcie ${PORT}`);
}); 