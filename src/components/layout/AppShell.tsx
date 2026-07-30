import { Cloud, LayoutDashboard, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function AppShell() {
  const { user, logOut } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-lockup">
            <div className="brand-mark">DHQ</div>
            <div>
              <strong>Dynasty HQ</strong>
              <span>College Football Companion</span>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Main navigation">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <LayoutDashboard size={19} /> Dashboard
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <UserRound size={19} /> Account
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-account">
          <div className="sync-pill">
            {user?.isAnonymous ? <ShieldCheck size={16} /> : <Cloud size={16} />}
            {user?.isAnonymous ? 'Guest save' : 'Cloud sync active'}
          </div>
          <button className="sidebar-logout" onClick={() => void logOut()}>
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Dynasty command center</p>
            <h1>Welcome back, {user?.displayName || (user?.isAnonymous ? 'Guest Coach' : 'Coach')}</h1>
          </div>
          <div className="topbar-avatar">
            {(user?.displayName || user?.email || 'D').charAt(0).toUpperCase()}
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
