import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InfoPage } from './pages/InfoPage';
import { ReadPage } from './pages/ReadPage';
import { BottomNav } from './components/BottomNav';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <main className="app-content">
          <Routes>
            <Route path="/" element={<InfoPage />} />
            <Route path="/read" element={<ReadPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
