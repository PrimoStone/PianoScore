import { useState } from 'react';
import { pdfjs } from 'react-pdf';
import PdfManager from './components/PdfManager';

// Konfiguracja worker'a dla react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
