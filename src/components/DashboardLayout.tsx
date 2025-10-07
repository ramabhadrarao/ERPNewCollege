import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth.slice';
import type { RootState, AppDispatch } from '../store';

interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon: string;
  children?: MenuItem[];
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);

  React.useEffect(() => {
    // In a real app, fetch menu items from backend based on user permissions
    const demoMenuItems = [
      {
        id: 1,
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'home'
      },
      {
        id: 2,
        name: 'User Management',
        path: '/users',
        icon: 'users'
      },
      {
        id: 3,
        name: 'Groups',
        path: '/groups',
        icon: 'users-group'
      },
      {
        id: 4,
        name: 'Menu Management',
        path: '/menus',
        icon: 'menu-2'
      },
      {
        id: 5,
        name: 'Permissions',
        path: '/permissions',
        icon: 'shield-lock'
      }
    ];
    setMenuItems(demoMenuItems);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="page">
      {/* Navbar */}
      <header className="navbar navbar-expand-md navbar-dark d-print-none">
        <div className="container-xl">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar-menu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
            RBAC System
          </h1>
          <div className="navbar-nav flex-row order-md-last">
            <div className="nav-item dropdown">
              <a
                href="#"
                className="nav-link d-flex lh-1 text-reset p-0"
                data-bs-toggle="dropdown"
                aria-label="Open user menu"
              >
                <div className="d-none d-xl-block ps-2">
                  <div>{user?.username}</div>
                </div>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                <a href="#" className="dropdown-item" onClick={handleLogout}>
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="page-wrapper">
        <div className="container-xl">
          <div className="page-header d-print-none">
            <div className="row g-2 align-items-center">
              <div className="col">
                <div className="page-pretitle">Overview</div>
                <h2 className="page-title">Dashboard</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="page-body">
          <div className="container-xl">
            <div className="row row-deck row-cards">{children}</div>
          </div>
        </div>
      </div>

      {/* Sidebar Menu */}
      <aside className="navbar navbar-vertical navbar-expand-lg navbar-dark">
        <div className="container-fluid">
          <div className="collapse navbar-collapse" id="navbar-menu">
            <ul className="navbar-nav pt-lg-3">
              {menuItems.map((item) => (
                <li key={item.id} className="nav-item">
                  <a
                    className="nav-link"
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                  >
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <i className={`icon icon-${item.icon}`}></i>
                    </span>
                    <span className="nav-link-title">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DashboardLayout;