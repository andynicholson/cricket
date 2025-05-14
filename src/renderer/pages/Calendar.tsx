import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Plus } from 'react-feather';

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background-color: #2563eb;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1d4ed8;
  }
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

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e5e7eb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
`;

const CalendarHeaderCell = styled.div`
  padding: 12px;
  text-align: center;
  font-weight: 500;
  color: #4b5563;
  border-right: 1px solid #e5e7eb;

  &:last-child {
    border-right: none;
  }
`;

const CalendarDay = styled.div<{ isToday?: boolean; isOtherMonth?: boolean }>`
  background-color: white;
  min-height: 120px;
  padding: 8px;
  position: relative;

  ${props => props.isToday && `
    background-color: #f0f9ff;
  `}

  ${props => props.isOtherMonth && `
    background-color: #f9fafb;
    color: #9ca3af;
  `}
`;

const DayNumber = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Event = styled.div`
  background-color: #2563eb;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const Calendar: React.FC = () => {
  // Mock data for demonstration
  const events = [
    { id: 1, title: 'Morning Trail Run', date: '2024-03-20', time: '06:00' },
    { id: 2, title: 'Weekend Long Run', date: '2024-03-23', time: '08:00' },
    { id: 3, title: 'Race Planning', date: '2024-03-25', time: '19:00' },
  ];

  return (
    <CalendarContainer>
      <Header>
        <Title>March 2024</Title>
        <Controls>
          <IconButton>
            <ChevronLeft size={20} />
          </IconButton>
          <Button>
            <Plus size={20} />
            New Event
          </Button>
          <IconButton>
            <ChevronRight size={20} />
          </IconButton>
        </Controls>
      </Header>

      <CalendarHeader>
        <CalendarHeaderCell>Sun</CalendarHeaderCell>
        <CalendarHeaderCell>Mon</CalendarHeaderCell>
        <CalendarHeaderCell>Tue</CalendarHeaderCell>
        <CalendarHeaderCell>Wed</CalendarHeaderCell>
        <CalendarHeaderCell>Thu</CalendarHeaderCell>
        <CalendarHeaderCell>Fri</CalendarHeaderCell>
        <CalendarHeaderCell>Sat</CalendarHeaderCell>
      </CalendarHeader>

      <CalendarGrid>
        {/* Calendar days would be generated here */}
        <CalendarDay isOtherMonth>
          <DayNumber>25</DayNumber>
        </CalendarDay>
        <CalendarDay isOtherMonth>
          <DayNumber>26</DayNumber>
        </CalendarDay>
        <CalendarDay isOtherMonth>
          <DayNumber>27</DayNumber>
        </CalendarDay>
        <CalendarDay isOtherMonth>
          <DayNumber>28</DayNumber>
        </CalendarDay>
        <CalendarDay isOtherMonth>
          <DayNumber>29</DayNumber>
        </CalendarDay>
        <CalendarDay>
          <DayNumber>1</DayNumber>
        </CalendarDay>
        <CalendarDay>
          <DayNumber>2</DayNumber>
        </CalendarDay>
        {/* ... more days ... */}
        <CalendarDay isToday>
          <DayNumber>20</DayNumber>
          <Event>Morning Trail Run</Event>
        </CalendarDay>
        {/* ... more days ... */}
      </CalendarGrid>
    </CalendarContainer>
  );
};

export default Calendar; 