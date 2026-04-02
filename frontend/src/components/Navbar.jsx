/**
 * Navbar Component - Top navigation bar with auth controls.
 */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, canAccessDashboard } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">💰</span>
          <span className="logo-text">FinDash</span>
        </Link>
      </div>

      <div className="navbar-links">
        {canAccessDashboard && (
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Dashboard
          </Link>
        )}
        <Link to="/records" className={`nav-link ${isActive('/records') ? 'active' : ''}`}>
          Records
        </Link>
        {isAdmin && (
          <>
            <Link to="/records/new" className={`nav-link ${isActive('/records/new') ? 'active' : ''}`}>
              Add Record
            </Link>
            <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
              Users
            </Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className={`user-role role-${user?.role?.toLowerCase()}`}>{user?.role}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}
