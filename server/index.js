const express = require('express');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Endpoints
app.get('/api/browse-folder', (req, res) => {
  console.log('Otrzymano żądanie browse-folder');
  
  if (process.platform === 'win32') {
    const command = `powershell.exe -command "& {
      Add-Type -AssemblyName System.Windows.Forms
      $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
      $dialog.Description = 'Wybierz folder z nutami'
      $dialog.ShowNewFolderButton = $true
      if ($dialog.ShowDialog() -eq 'OK') {
        Write-Output $dialog.SelectedPath
      }
    }"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Błąd wykonania komendy:', error);
        res.status(500).json({ error: 'Nie udało się otworzyć dialogu' });
        return;
      }

      const selectedPath = stdout.trim();
      console.log('Wybrana ścieżka:', selectedPath);

      if (selectedPath && selectedPath !== '') {
        const normalizedPath = selectedPath
          .replace(/\\/g, '/')
          .replace(/[\r\n]+/g, '');
        
        console.log('Znormalizowana ścieżka:', normalizedPath);
        res.json({ path: normalizedPath });
      } else {
        res.json({ path: null });
      }
    });
  } else {
    res.status(500).json({ error: 'Funkcja niedostępna dla tego systemu operacyjnego' });
  }
});

// Start serwera
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na porcie ${PORT}`);
  console.log(`http://localhost:${PORT}`);
}); 