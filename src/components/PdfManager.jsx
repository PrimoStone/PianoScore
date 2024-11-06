import { useState, useEffect } from 'react';
import FolderManager from '../utils/folderAccess';
import PdfViewer from './PdfViewer';
import '../styles/PdfManager.css';

const PdfManager = () => {
  const [folderHandle, setFolderHandle] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const folderManager = new FolderManager();

  const handleSelectFolder = async () => {
    try {
      const handle = await folderManager.selectDirectory();
      setFolderHandle(handle);
      const files = await folderManager.listPdfFiles(handle);
      setPdfFiles(files);
      setSelectedPdf(null); // Reset selection when changing folder
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Błąd podczas wybierania folderu:', error);
      }
    }
  };

  const handlePdfSelect = async (event) => {
    const selectedFile = pdfFiles.find(pdf => pdf.name === event.target.value);
    if (selectedFile) {
      try {
        if (selectedPdf?.url) {
          URL.revokeObjectURL(selectedPdf.url);
        }

        const file = await selectedFile.handle.getFile();
        
        if (!file.type.includes('pdf')) {
          throw new Error('Wybrany plik nie jest w formacie PDF');
        }

        console.log('Rozmiar pliku:', file.size, 'bajtów');
        
        const url = URL.createObjectURL(file);
        console.log('Utworzono URL:', url);

        setSelectedPdf({
          ...selectedFile,
          url: url,
          type: file.type
        });
      } catch (error) {
        console.error('Szczegóły błędu:', error);
        alert(`Nie udało się otworzyć pliku: ${error.message}`);
        setSelectedPdf(null);
      }
    }
  };

  const handleCloseViewer = () => {
    if (selectedPdf?.url) {
      URL.revokeObjectURL(selectedPdf.url);
    }
    setSelectedPdf(null);
  };

  return (
    <div className="pdf-manager">
      <div className="controls-section">
        <button 
          className="folder-button"
          onClick={handleSelectFolder}
        >
          {folderHandle ? 'Zmień folder' : 'Wybierz folder z nutami'}
        </button>
        
        {folderHandle && (
          <div className="folder-info">
            <span className="folder-name">Folder: {folderHandle.name}</span>
            <select 
              className="pdf-select"
              value={selectedPdf?.name || ''}
              onChange={handlePdfSelect}
            >
              <option value="">Wybierz plik PDF</option>
              {pdfFiles.map((pdf) => (
                <option key={pdf.name} value={pdf.name}>
                  {pdf.name} ({(pdf.size / 1024 / 1024).toFixed(2)} MB)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedPdf?.url ? (
        <PdfViewer 
          file={selectedPdf.url} 
          onClose={handleCloseViewer}
        />
      ) : (
        <div className="no-pdf-selected">
          {folderHandle 
            ? 'Wybierz plik PDF z listy'
            : 'Wybierz folder aby zobaczyć dostępne pliki'}
        </div>
      )}
    </div>
  );
};

export default PdfManager;