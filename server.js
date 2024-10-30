import express from 'express';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.get('/api/scores', async (req, res) => {
    try {
      const scoresDir = join(__dirname, 'public', 'scores');
      const files = await readdir(scoresDir);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      res.json(pdfFiles);
    } catch (error) {
      console.error('Error reading scores directory:', error);
      res.status(500).json({ error: 'Unable to read scores directory' });
    }
  });

  app.use('/scores', express.static(join(__dirname, 'public', 'scores')));

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template = await vite.transformIndexHtml(url, '');
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(3001, () => {
    console.log('Server running at http://localhost:3001');
  });
}

createServer();
