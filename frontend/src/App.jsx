import React, { useState } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function App() {
  // Simple state-based routing to keep deployment and code presentation clean and straightforward
  const [currentPage, setCurrentPage] = useState('home');

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-900">
      {currentPage === 'home' ? (
        <Home onStart={() => navigateTo('dashboard')} />
      ) : (
        <Dashboard onBack={() => navigateTo('home')} />
      )}
    </div>
  );
}

export default App;
