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

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get('/api/scores', async (req, res) => {
  console.log('Próba pobrania listy plików...');
  try {
    // Sprawdź ścieżkę do folderu scores
    const scoresPath = join(__dirname, 'public', 'scores');
    console.log('Ścieżka do folderu scores:', scoresPath);

    // Sprawdź czy folder istnieje
    if (!fs.existsSync(scoresPath)) {
      console.log('Folder scores nie istnieje!');
      // Zwróć pustą listę zamiast błędu
      return res.json({ files: [] });
    }

    // Pobierz listę plików
    const files = fs.readdirSync(scoresPath);
    console.log('Znalezione pliki:', files);

    // Filtruj pliki PDF
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    console.log('Pliki PDF:', pdfFiles);

    return res.json({ files: pdfFiles });
  } catch (error) {
    console.error('Szczegóły błędu:', error);
    // Zwróć bardziej szczegółową informację o błędzie
    return res.status(500).json({ 
      error: 'Nie udało się pobrać listy plików',
      details: error.message,
      files: []
    });
  }
});

const PORT = 3002;

app.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na porcie ${PORT}`);
  
  // Sprawdź folder scores przy starcie
  const scoresPath = join(__dirname, 'public', 'scores');
  console.log('Ścieżka do folderu scores:', scoresPath);
  
  if (fs.existsSync(scoresPath)) {
    const files = fs.readdirSync(scoresPath);
    console.log('Pliki w folderze scores:', files);
  } else {
    console.log('UWAGA: Folder scores nie istnieje!');
    console.log('Utwórz folder:', scoresPath);
  }
});
