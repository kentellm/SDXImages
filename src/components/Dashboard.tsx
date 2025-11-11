import { useState } from 'react';
import PaginatedImageGallery from './ImageGallery';
import TodoList from './TodoList';
import './Dashboard.css';

function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`dashboard ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Top Menu Bar */}
      <header className="top-menu-bar">
        <div className="menu-left">
          <h1 className="app-title">Sample Dashboard</h1>
        </div>

        <div className="menu-right">
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Grid Layout - 2x2 on desktop, 1x4 on mobile */}
      <main className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>📸 Gallery</h2>
          </div>
          <div className="card-content">
            <PaginatedImageGallery />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>✓ To-Do List</h2>
          </div>
          <div className="card-content">
            <TodoList />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>📊 Analytics</h2>
          </div>
          <div className="card-content placeholder">
            <p>Analytics component goes here</p>
            <div className="placeholder-box">
              <span>Chart Component</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>⚙️ Settings</h2>
          </div>
          <div className="card-content placeholder">
            <p>Settings component goes here</p>
            <div className="placeholder-box">
              <span>Settings Form</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;