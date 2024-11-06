import { useState } from 'react';
import { pdfjs } from 'react-pdf';
import PdfManager from './components/PdfManager';

// Ustaw dokładną wersję workera
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

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
