import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Plus } from 'react-feather';
import { getEvents } from '../../shared/firestore';
import type { Event as EventType } from '../../shared/types';
import { Timestamp } from 'firebase/firestore';

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

const CalendarDay = styled.div<{ $isToday?: boolean; $isOtherMonth?: boolean }>`
  background-color: white;
  min-height: 120px;
  padding: 8px;
  position: relative;

  ${props => props.$isToday && `
    background-color: #f0f9ff;
  `}

  ${props => props.$isOtherMonth && `
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
  const [events, setEvents] = useState<EventType[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadEvents = async () => {
      console.log('Fetching events from Firestore...');
      try {
        const loadedEvents = await getEvents();
        console.log('Raw events from Firestore:', loadedEvents);
        // Convert Firestore Timestamps to Date objects
        const processedEvents = loadedEvents.map(event => {
          try {
            const startTime = event.startTime instanceof Timestamp 
              ? event.startTime.toDate() 
              : new Date(event.startTime);
            const endTime = event.endTime instanceof Timestamp 
              ? event.endTime.toDate() 
              : new Date(event.endTime);
            
            // Validate dates
            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
              console.error('Invalid date found in event:', event);
              return null;
            }
            
            return {
              ...event,
              startTime,
              endTime
            };
          } catch (error) {
            console.error('Error processing event:', event, error);
            return null;
          }
        }).filter((event): event is EventType => event !== null);
        
        console.log('Processed events with Date objects:', processedEvents);
        setEvents(processedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };
    loadEvents();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add days from the previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <CalendarDay key={`prev-${i}`} $isOtherMonth>
          <DayNumber>{new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() - firstDayOfMonth + i + 1}</DayNumber>
        </CalendarDay>
      );
    }

    // Add days from the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toDateString();
      const dayEvents = events.filter(event => {
        try {
          const eventDate = new Date(event.startTime);
          if (isNaN(eventDate.getTime())) {
            console.error('Invalid event date:', event);
            return false;
          }

          const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
          const matches = eventDate.getDate() === i && 
                         eventDate.getMonth() === currentDate.getMonth() && 
                         eventDate.getFullYear() === currentDate.getFullYear();

          console.log(`Checking event for day ${i}:`, {
            eventDate: eventDate.toString(),
            currentDate: currentDayDate.toString(),
            matches
          });

          if (matches) {
            console.log(`Found event for day ${i}:`, event);
          }
          return matches;
        } catch (error) {
          console.error('Error processing event date:', event, error);
          return false;
        }
      });

      days.push(
        <CalendarDay key={i} $isToday={isToday}>
          <DayNumber>{i}</DayNumber>
          {dayEvents.map(event => (
            <Event key={event.id}>{event.title}</Event>
          ))}
        </CalendarDay>
      );
    }

    // Add days from the next month
    const totalDays = 42; // 6 rows of 7 days
    for (let i = 1; i <= totalDays - (firstDayOfMonth + daysInMonth); i++) {
      days.push(
        <CalendarDay key={`next-${i}`} $isOtherMonth>
          <DayNumber>{i}</DayNumber>
        </CalendarDay>
      );
    }

    return days;
  };

  return (
    <CalendarContainer>
      <Header>
        <Title>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Title>
        <Controls>
          <IconButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
            <ChevronLeft size={20} />
          </IconButton>
          <Button>
            <Plus size={20} />
            New Event
          </Button>
          <IconButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
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
        {renderCalendarDays()}
      </CalendarGrid>
    </CalendarContainer>
  );
};

export default Calendar; 