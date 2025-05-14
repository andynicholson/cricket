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

const Event = styled.div<{ $isFirstDay?: boolean; $isLastDay?: boolean; $isMultiDay?: boolean }>`
  background-color: #2563eb;
  color: white;
  padding: 4px 8px;
  border-radius: ${props => {
    if (props.$isMultiDay) {
      if (props.$isFirstDay) return '4px 0 0 4px';
      if (props.$isLastDay) return '0 4px 4px 0';
      return '0';
    }
    return '4px';
  }};
  font-size: 12px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;

  &:hover {
    background-color: #1d4ed8;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to right, transparent, ${props => props.$isLastDay ? '#1d4ed8' : '#2563eb'});
    pointer-events: none;
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
            // Ensure we're working with UTC dates to avoid timezone issues
            const startTime = event.startTime instanceof Timestamp 
              ? new Date(event.startTime.toDate().toISOString())
              : new Date(new Date(event.startTime).toISOString());
            const endTime = event.endTime instanceof Timestamp 
              ? new Date(event.endTime.toDate().toISOString())
              : new Date(new Date(event.endTime).toISOString());
            
            console.log('Processing event dates:', {
              id: event.id,
              title: event.title,
              originalStart: event.startTime,
              originalEnd: event.endTime,
              processedStart: startTime.toISOString(),
              processedEnd: endTime.toISOString(),
              startDay: startTime.getDate(),
              endDay: endTime.getDate()
            });
            
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

  const isSameDay = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1.getTime() === d2.getTime();
  };

  const isDateInRange = (date: Date, start: Date, end: Date) => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return checkDate >= startDate && checkDate <= endDate;
  };

  const getDayNumber = (currentDate: Date, startDate: Date) => {
    // Create date objects with time set to midnight to ensure consistent day calculation
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add days from the previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0 - firstDayOfMonth + i + 1);
      const dayEvents = events.filter(event => 
        isDateInRange(prevMonthDate, event.startTime, event.endTime)
      );

      days.push(
        <CalendarDay key={`prev-${i}`} $isOtherMonth>
          <DayNumber>{prevMonthDate.getDate()}</DayNumber>
          {dayEvents.map(event => (
            <Event 
              key={event.id}
              $isFirstDay={isSameDay(prevMonthDate, event.startTime)}
              $isLastDay={isSameDay(prevMonthDate, event.endTime)}
              $isMultiDay={!isSameDay(event.startTime, event.endTime)}
            >
              {!isSameDay(event.startTime, event.endTime) && 
                `Day ${getDayNumber(prevMonthDate, event.startTime)}: `}
              {event.title}
            </Event>
          ))}
        </CalendarDay>
      );
    }

    // Add days from the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isToday = new Date().toDateString() === currentDayDate.toDateString();
      const dayEvents = events.filter(event => 
        isDateInRange(currentDayDate, event.startTime, event.endTime)
      );

      days.push(
        <CalendarDay key={i} $isToday={isToday}>
          <DayNumber>{i}</DayNumber>
          {dayEvents.map(event => (
            <Event 
              key={event.id}
              $isFirstDay={isSameDay(currentDayDate, event.startTime)}
              $isLastDay={isSameDay(currentDayDate, event.endTime)}
              $isMultiDay={!isSameDay(event.startTime, event.endTime)}
            >
              {!isSameDay(event.startTime, event.endTime) && 
                `Day ${getDayNumber(currentDayDate, event.startTime)}: `}
              {event.title}
            </Event>
          ))}
        </CalendarDay>
      );
    }

    // Add days from the next month
    const totalDays = 42; // 6 rows of 7 days
    for (let i = 1; i <= totalDays - (firstDayOfMonth + daysInMonth); i++) {
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      const dayEvents = events.filter(event => 
        isDateInRange(nextMonthDate, event.startTime, event.endTime)
      );

      days.push(
        <CalendarDay key={`next-${i}`} $isOtherMonth>
          <DayNumber>{i}</DayNumber>
          {dayEvents.map(event => (
            <Event 
              key={event.id}
              $isFirstDay={isSameDay(nextMonthDate, event.startTime)}
              $isLastDay={isSameDay(nextMonthDate, event.endTime)}
              $isMultiDay={!isSameDay(event.startTime, event.endTime)}
            >
              {!isSameDay(event.startTime, event.endTime) && 
                `Day ${getDayNumber(nextMonthDate, event.startTime)}: `}
              {event.title}
            </Event>
          ))}
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