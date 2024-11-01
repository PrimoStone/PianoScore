import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Dodaj obsługę plików statycznych z folderu public
app.use(express.static('public'));

app.get('/api/scores', (req, res) => {
  try {
    // Zmiana ścieżki na public/scores
    const scoresPath = join(process.cwd(), 'public', 'scores');
    console.log('Ścieżka do folderu scores:', scoresPath);
    
    if (!fs.existsSync(scoresPath)) {
      console.log('Folder scores nie istnieje!');
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(scoresPath);
    console.log('Znalezione pliki:', files);
    
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    res.json({ files: pdfFiles });
  } catch (error) {
    console.error('Błąd:', error);
    res.status(500).json({ error: 'Nie udało się pobrać listy plików' });
  }
});

app.get('/api/scores/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    // Zmiana ścieżki na public/scores
    const filePath = join(process.cwd(), 'public', 'scores', filename);
    console.log('Próba pobrania pliku:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('Plik nie istnieje:', filePath);
      return res.status(404).json({ error: 'Plik nie został znaleziony' });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Błąd:', error);
    res.status(500).json({ error: 'Nie udało się pobrać pliku' });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na porcie ${PORT}`);
  
  // Sprawdź folder scores przy starcie
  const scoresPath = join(process.cwd(), 'public', 'scores');
  console.log('\nSprawdzanie folderu scores:');
  console.log('Ścieżka:', scoresPath);
  
  if (fs.existsSync(scoresPath)) {
    const files = fs.readdirSync(scoresPath);
    console.log('Pliki w folderze scores:', files);
  } else {
    console.log('UWAGA: Folder scores nie istnieje!');
  }
});
