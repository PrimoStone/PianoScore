import { useState, useEffect } from 'react';
import FolderManager from '../utils/folderAccess';
import PdfViewer from './PdfViewer';
import '../styles/PdfManager.css';

const PdfManager = () => {
  const [folderHandle, setFolderHandle] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const folderManager = new FolderManager();

  // Czyszczenie URL przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      if (selectedPdf?.url) {
        URL.revokeObjectURL(selectedPdf.url);
      }
    };
  }, [selectedPdf]);

  const handleSelectFolder = async () => {
    try {
      const handle = await folderManager.selectDirectory();
      setFolderHandle(handle);
      const files = await folderManager.listPdfFiles(handle);
      setPdfFiles(files);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Błąd podczas wybierania folderu:', error);
      }
    }
  };

  const handlePdfSelect = async (pdfFile) => {
    try {
      // Wyczyść poprzedni URL
      if (selectedPdf?.url) {
        URL.revokeObjectURL(selectedPdf.url);
      }

      const file = await pdfFile.handle.getFile();
      console.log('Załadowano plik:', file.name, 'rozmiar:', file.size);
      
      // Stwórz nowy URL dla pliku
      const url = URL.createObjectURL(file);
      console.log('Utworzono URL:', url);
      
      setSelectedPdf({
        ...pdfFile,
        url: url
      });
    } catch (error) {
      console.error('Błąd podczas otwierania pliku:', error);
    }
  };

  const handleCloseViewer = () => {
    setIsFullscreen(false);
    setSelectedPdf(null);
  };

  return (
    <div className="pdf-manager">
      <div className="folder-section">
        <button onClick={handleSelectFolder}>
          {folderHandle ? 'Zmień folder' : 'Wybierz folder z nutami'}
        </button>
        {folderHandle && <h3>Folder: {folderHandle.name}</h3>}
      </div>

      <div className="content-section">
        <div className="pdf-list">
          <h4>Dostępne pliki:</h4>
          {pdfFiles.length > 0 ? (
            <ul>
              {pdfFiles.map((pdf) => (
                <li 
                  key={pdf.name}
                  className={`pdf-item ${selectedPdf?.name === pdf.name ? 'selected' : ''}`}
                  onClick={() => handlePdfSelect(pdf)}
                >
                  <span className="pdf-icon">📄</span>
                  <span className="pdf-name">{pdf.name}</span>
                  <span className="pdf-size">
                    ({(pdf.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-files">
              {folderHandle 
                ? 'Brak plików PDF w wybranym folderze' 
                : 'Wybierz folder aby zobaczyć pliki'}
            </p>
          )}
        </div>

        <div className="viewer-container">
          {selectedPdf?.url && (
            <PdfViewer 
              file={selectedPdf.url} 
              onClose={handleCloseViewer}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfManager;