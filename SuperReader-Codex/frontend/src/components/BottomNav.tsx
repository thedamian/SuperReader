import { NavLink } from 'react-router-dom';
import { UserCircle, Camera } from 'lucide-react';

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="bottom-nav"
      role="navigation"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `nav-link ${isActive ? 'nav-link--active' : ''}`
        }
        aria-label="Your Information"
      >
        <UserCircle aria-hidden="true" />
        <span>Info</span>
      </NavLink>
      <NavLink
        to="/read"
        className={({ isActive }) =>
          `nav-link ${isActive ? 'nav-link--active' : ''}`
        }
        aria-label="Read Form"
      >
        <Camera aria-hidden="true" />
        <span>Read</span>
      </NavLink>
    </nav>
  );
}
