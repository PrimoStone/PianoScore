export default class FolderManager {
  async selectDirectory() {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'application/pdf'; // Accept only PDF files
      
      return new Promise((resolve, reject) => {
        input.onchange = async (e) => {
          try {
            const files = Array.from(e.target.files);
            // Check file sizes and create file handles
            const pdfFiles = files
              .filter(file => file.name.toLowerCase().endsWith('.pdf'))
              .map(file => ({
                name: file.name,
                size: file.size,
                handle: {
                  getFile: async () => file
                }
              }));

            resolve(pdfFiles);
          } catch (error) {
            reject(error);
          }
        };
        
        input.onerror = reject;
        input.click();
      });
    } catch (error) {
      console.error('Error selecting files:', error);
      throw error;
    }
  }

  // This method is now simplified since we handle files directly
  async listPdfFiles(files) {
    return files;
  }
}