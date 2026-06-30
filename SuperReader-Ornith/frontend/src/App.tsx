import { useState } from 'react';
import InfoPage from './components/InfoPage';
import CameraPage from './components/CameraPage';
import BottomNav from './components/BottomNav';
import type { UserData } from './types/userData';

type Page = 'info' | 'camera';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('info');
  const [userData, setUserData] = useState<UserData>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('superreader-user-data');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSaveUserData = (data: UserData) => {
    setUserData(data);
    localStorage.setItem('superreader-user-data', JSON.stringify(data));
  };

  const switchPage = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app">
      <main className="main-content" role="main">
        {currentPage === 'info' ? (
          <InfoPage 
            userData={userData} 
            onSave={handleSaveUserData}
            onSwitchToCamera={() => switchPage('camera')}
          />
        ) : (
          <CameraPage 
            userData={userData}
            onSwitchToInfo={() => switchPage('info')}
          />
        )}
      </main>
      
      <BottomNav currentPage={currentPage} onNavigate={switchPage} />
    </div>
  );
}

export default App;
