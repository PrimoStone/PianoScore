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
    } catch (error) {
      if (error.name !== 'AbortError') {
        alert('Nie udało się otworzyć folderu: ' + error.message);
      }
    }
  };

  const handlePdfSelect = async (pdfFile) => {
    try {
      const file = await pdfFile.handle.getFile();
      setSelectedPdf(file);
    } catch (error) {
      alert('Nie udało się otworzyć pliku PDF: ' + error.message);
    }
  };

  return (
    <div className="pdf-manager">
      <div className="folder-section">
        <button className="folder-button" onClick={handleSelectFolder}>
          {folderHandle ? 'Zmień folder' : 'Wybierz folder z nutami'}
        </button>
        {folderHandle && (
          <h3 className="folder-name">Folder: {folderHandle.name}</h3>
        )}
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

        <div className="pdf-viewer-container">
          {selectedPdf ? (
            <PdfViewer file={selectedPdf} />
          ) : (
            <div className="no-pdf-selected">
              Wybierz plik PDF z listy
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfManager;