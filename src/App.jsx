import React, { useState } from 'react';
import ScoreSelector from './components/ScoreSelector';

function App() {
  const [isFileView, setIsFileView] = useState(true);

  return (
    <div className="App">
      {isFileView && <h1>Piano Score Viewer</h1>}
      <ScoreSelector onViewChange={setIsFileView} />
    </div>
  );
}

export default App;
