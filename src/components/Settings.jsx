const handleBrowse = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Zmień port na taki sam jak w serwerze
    const response = await fetch('http://localhost:3003/api/browse-folder');
    // ... reszta kodu
  } catch (err) {
    // ... obsługa błędów
  }
}; 