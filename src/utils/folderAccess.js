class FolderManager {
  async selectDirectory() {
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'read'
      });
      
      localStorage.setItem('pdfFolderHandle', JSON.stringify({
        name: handle.name
      }));
      
      return handle;
    } catch (error) {
      console.error('Błąd podczas wybierania folderu:', error);
      throw error;
    }
  }

  async listPdfFiles(dirHandle) {
    const files = [];
    try {
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.pdf')) {
          const file = await entry.getFile();
          if (file.size <= 3 * 1024 * 1024) {
            files.push({
              name: entry.name,
              handle: entry,
              size: file.size
            });
          }
        }
      }
    } catch (error) {
      console.error('Błąd podczas listowania plików:', error);
    }
    return files;
  }
}

export default FolderManager; 