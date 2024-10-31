import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Szczegółowa konfiguracja CORS
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware do logowania
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Dodaj nagłówki CORS dla wszystkich odpowiedzi
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Obsługa preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Serwowanie statycznych plików
app.use(express.static(path.join(__dirname, '../../public')));

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
        path: `/scores/${file}` // Zmiana ścieżki
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