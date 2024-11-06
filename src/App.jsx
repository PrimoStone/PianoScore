import { useState } from 'react';
import { pdfjs } from 'react-pdf';
import PdfManager from './components/PdfManager';

// Ustaw worker z CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function App() {
  return (
    <div className="app">
      <header>
        <h1>Moje Nuty</h1>
      </header>
      <main>
        <PdfManager />
      </main>
    </div>
  );
}

export default App;
