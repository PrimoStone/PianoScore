export default class FolderManager {
  async selectDirectory() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.webkitdirectory = true;
      input.directory = true;

      input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) {
          reject(new Error('Nie wybrano żadnych plików'));
          return;
        }

        const handle = {
          kind: 'directory',
          name: files[0]?.webkitRelativePath.split('/')[0] || 'Wybrany folder',
          values: async function* () {
            for (const file of files) {
              if (file.name.toLowerCase().endsWith('.pdf')) {
                yield {
                  kind: 'file',
                  name: file.name,
                  getFile: async () => file
                };
              }
            }
          }
        };
        resolve(handle);
      };

      input.onerror = reject;
      
      // Dodaj input do DOM tymczasowo
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    });
  }

  async listPdfFiles(dirHandle) {
    const files = [];
    try {
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          files.push({
            name: entry.name,
            handle: entry,
            size: file.size
          });
        }
      }
    } catch (error) {
      console.error('Błąd podczas listowania plików:', error);
    }
    return files;
  }
} 