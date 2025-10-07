import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import UserManagement from './pages/UserManagement';
import GroupManagement from './pages/GroupManagement';
import MenuManagement from './pages/MenuManagement';
import './App.css';

// Import Tabler styles
import '@tabler/core/dist/css/tabler.min.css';
import '@tabler/core/dist/js/tabler.min.js';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = localStorage.getItem('user');
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/dashboard" element={<div>Dashboard Content</div>} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/groups" element={<GroupManagement />} />
                    <Route path="/menus" element={<MenuManagement />} />
                    <Route index element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
