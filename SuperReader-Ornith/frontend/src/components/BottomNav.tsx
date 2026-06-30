import { useCallback } from 'react';

type Page = 'info' | 'camera';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const BottomNav = ({ currentPage, onNavigate }: BottomNavProps) => {
  const handleNavigation = useCallback((page: Page) => {
    onNavigate(page);
  }, [onNavigate]);

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <button 
        onClick={() => handleNavigation('info')}
        className={`nav-button ${currentPage === 'info' ? 'active' : ''}`}
        aria-current={currentPage === 'info' ? 'page' : undefined}
        aria-label="Go to information page"
      >
        <span className="nav-icon">📝</span>
        <span className="nav-label">Info</span>
      </button>

      <button 
        onClick={() => handleNavigation('camera')}
        className={`nav-button ${currentPage === 'camera' ? 'active' : ''}`}
        aria-current={currentPage === 'camera' ? 'page' : undefined}
        aria-label="Go to camera reader page"
      >
        <span className="nav-icon">📷</span>
        <span className="nav-label">Read</span>
      </button>
    </nav>
  );
};

export default BottomNav;
