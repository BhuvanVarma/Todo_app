import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="inner">
        <Link to="/todos" className="brand">✅ Todo App</Link>
        {user && (
          <div className="nav-info">
            <span>Hi, {user.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

