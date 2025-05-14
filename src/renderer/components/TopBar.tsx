import React from 'react';
import styled from 'styled-components';
import { Search, Bell, Settings } from 'react-feather';

const TopBarContainer = styled.header`
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 24px;
  justify-content: space-between;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 8px 16px;
  width: 400px;
  gap: 8px;

  input {
    border: none;
    background: none;
    outline: none;
    width: 100%;
    font-size: 14px;
    color: #1a1a1a;

    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    color: #1a1a1a;
  }
`;

const TopBar: React.FC = () => {
  return (
    <TopBarContainer>
      <SearchBar>
        <Search size={20} />
        <input type="text" placeholder="Search events, runners, or messages..." />
      </SearchBar>
      <Actions>
        <IconButton>
          <Bell size={20} />
        </IconButton>
        <IconButton>
          <Settings size={20} />
        </IconButton>
      </Actions>
    </TopBarContainer>
  );
};

export default TopBar; 