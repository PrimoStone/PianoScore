import { useState, useEffect } from 'react';
import FolderManager from '../utils/folderAccess';
import PdfViewer from './PdfViewer';

export const PdfManager = () => {
  const [folderHandle, setFolderHandle] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [scores, setScores] = useState({});
  const folderManager = new FolderManager();

  useEffect(() => {
    // Wczytaj zapisane wyniki przy starcie
    const savedScores = localStorage.getItem('scores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

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
      setCurrentPdf(file);
    } catch (error) {
      alert('Nie udało się otworzyć pliku PDF: ' + error.message);
    }
  };

  const saveScore = (pdfName, newScore) => {
    const updatedScores = { ...scores, [pdfName]: newScore };
    setScores(updatedScores);
    localStorage.setItem('scores', JSON.stringify(updatedScores));
  };

  return (
    <div className="pdf-manager">
      <div className="folder-section">
        <button onClick={handleSelectFolder}>
          {folderHandle ? 'Zmień folder' : 'Wybierz folder z nutami'}
        </button>
        
        {folderHandle && (
          <h3>Folder: {folderHandle.name}</h3>
        )}
      </div>

      <div className="content-section">
        <div className="pdf-list">
          {pdfFiles.map((pdf) => (
            <div 
              key={pdf.name}
              className={`pdf-item ${currentPdf?.name === pdf.name ? 'active' : ''}`}
              onClick={() => handlePdfSelect(pdf.handle)}
            >
              <span className="pdf-name">{pdf.name}</span>
              {scores[pdf.name] && (
                <span className="pdf-score">
                  Wynik: {scores[pdf.name]}%
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="pdf-viewer">
          {currentPdf && (
            <>
              <PdfViewer file={currentPdf} />
              <ScoreInput 
                pdfName={currentPdf.name}
                currentScore={scores[currentPdf.name]}
                onScoreSave={saveScore}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfManager;