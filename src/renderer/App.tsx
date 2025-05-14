import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const App: React.FC = () => {
  return (
    <AppContainer>
      <Sidebar />
      <MainContent>
        <TopBar />
        <ContentArea>
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
};

export default App; 