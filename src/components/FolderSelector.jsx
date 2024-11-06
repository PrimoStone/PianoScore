import { useState, useEffect } from 'react';
import { FolderManager } from '../utils/folderAccess';

const FolderSelector = () => {
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

  const handlePdfSelect = async (pdfHandle) => {
    try {
      const file = await pdfHandle.getFile();
      setSelectedPdf(file);
      // Tutaj możesz dodać logikę wyświetlania PDF
    } catch (error) {
      alert('Nie udało się otworzyć pliku PDF: ' + error.message);
    }
  };

  return (
    <div>
      <button onClick={handleSelectFolder}>
        {folderHandle ? 'Zmień folder' : 'Wybierz folder z plikami PDF'}
      </button>

      {folderHandle && (
        <div>
          <h3>Folder: {folderHandle.name}</h3>
          <div className="pdf-list">
            {pdfFiles.map((pdf) => (
              <div 
                key={pdf.name}
                className="pdf-item"
                onClick={() => handlePdfSelect(pdf.handle)}
              >
                <span>{pdf.name}</span>
                <span>{(pdf.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
            {pdfFiles.length === 0 && (
              <p>Brak plików PDF w wybranym folderze (max 3MB)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 