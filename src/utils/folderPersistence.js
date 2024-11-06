const FOLDER_PERMISSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dni

export const rememberFolder = async (handle) => {
  try {
    // Zapisz informacje o folderze
    localStorage.setItem('pdfFolder', JSON.stringify({
      name: handle.name,
      timestamp: Date.now()
    }));
    
    // Poproś o trwałe uprawnienia
    const permission = await handle.requestPermission({ mode: 'read' });
    return permission === 'granted';
  } catch (error) {
    console.error('Błąd podczas zapisywania uprawnień folderu:', error);
    return false;
  }
};

export const checkFolderPermission = async (handle) => {
  try {
    const savedData = localStorage.getItem('pdfFolder');
    if (!savedData) return false;

    const { timestamp } = JSON.parse(savedData);
    if (Date.now() - timestamp > FOLDER_PERMISSION_DURATION) {
      localStorage.removeItem('pdfFolder');
      return false;
    }

    return await handle.requestPermission({ mode: 'read' }) === 'granted';
  } catch {
    return false;
  }
}; 