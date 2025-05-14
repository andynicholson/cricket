import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Calendar as CalendarIcon,
  MessageSquare,
  Users,
  User,
  Map
} from 'react-feather';

const SidebarContainer = styled.aside`
  width: 240px;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  padding: 24px;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Nav = styled.nav`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #4b5563;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    color: #1a1a1a;
  }

  &.active {
    background-color: #f3f4f6;
    color: #1a1a1a;
    font-weight: 500;
  }
`;

const Sidebar: React.FC = () => {
  return (
    <SidebarContainer>
      <Logo>
        <Map size={24} />
        TrailConnect
      </Logo>
      <Nav>
        <NavItem to="/">
          <CalendarIcon size={20} />
          Calendar
        </NavItem>
        <NavItem to="/events">
          <Users size={20} />
          Events
        </NavItem>
        <NavItem to="/messages">
          <MessageSquare size={20} />
          Messages
        </NavItem>
        <NavItem to="/profile">
          <User size={20} />
          Profile
        </NavItem>
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar; 