export default class FolderManager {
  async selectDirectory() {
    try {
      // Sprawdź czy to urządzenie mobilne
      const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Użyj input file z ograniczeniami dla urządzeń mobilnych
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'application/pdf'; // Akceptuj tylko PDF
        
        return new Promise((resolve, reject) => {
          input.onchange = async (e) => {
            try {
              const files = Array.from(e.target.files);
              // Sprawdź rozmiar plików
              for (const file of files) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                  throw new Error('Plik jest zbyt duży. Maksymalny rozmiar to 10MB.');
                }
              }
              
              const handle = {
                kind: 'directory',
                name: 'Wybrane pliki',
                values: async function* () {
                  for (const file of files) {
                    yield {
                      kind: 'file',
                      name: file.name,
                      getFile: async () => file
                    };
                  }
                }
              };
              resolve(handle);
            } catch (error) {
              reject(error);
            }
          };
          
          input.onerror = reject;
          input.click();
        });
      } else {
        // Dla desktopów używaj standardowego showDirectoryPicker
        return await window.showDirectoryPicker({
          mode: 'read'
        });
      }
    } catch (error) {
      console.error('Błąd podczas wybierania folderu:', error);
      throw error;
    }
  }

  async listPdfFiles(dirHandle) {
    const files = [];
    try {
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          try {
            const file = await entry.getFile();
            files.push({
              name: entry.name,
              handle: entry,
              size: file.size
            });
          } catch (error) {
            console.error('Błąd podczas pobierania pliku:', error);
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Błąd podczas listowania plików:', error);
      throw error;
    }
    return files;
  }
} 