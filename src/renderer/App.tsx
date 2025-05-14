import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../shared/store';

const App: React.FC = () => {
  const version = useSelector((state: RootState) => state.app.version);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Cricket</h1>
          <p className="text-sm text-gray-500">Version {version}</p>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            {/* Add more routes here */}
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App; 