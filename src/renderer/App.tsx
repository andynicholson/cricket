import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { StravaProvider } from './contexts/StravaContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Calendar from './pages/Calendar';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Events from './pages/Events';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const App: React.FC = () => {
  return (
    <StravaProvider>
      <AppContainer>
        <Sidebar />
        <MainContent>
          <TopBar />
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/events" element={<Events />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </StravaProvider>
  );
};

export default App; 