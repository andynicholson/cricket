import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon } from 'react-feather';
import { getEvents, addEvent } from '../../shared/firestore';
import type { Event as EventType } from '../../shared/types';
import { Timestamp } from 'firebase/firestore';
import { ipcRenderer } from 'electron';

declare global {
  interface Window {
    electron: {
      getVersion: () => Promise<string>;
      searchUnsplash: (query: string) => Promise<string>;
    }
  }
}

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 700px;
  min-height: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f3f4f6;
    color: #1a1a1a;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1a1a1a;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1a1a1a;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const DateTimeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const SubmitButton = styled.button`
  background-color: #2563eb;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover {
    background-color: #1d4ed8;
  }

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-top: 4px;
`;

const DatePickerWrapper = styled.div`
  position: relative;
`;

const DatePickerInput = styled(Input)`
  padding-right: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
`;

const CalendarButton = styled.button`
  display: none;
`;

const DatePickerDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
  padding: 8px;
  width: 300px;
`;

const DatePickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const DatePickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  background: white;
`;

const DatePickerCell = styled.button<{ $isSelected?: boolean; $isToday?: boolean; $isOtherMonth?: boolean; $isDisabled?: boolean }>`
  padding: 4px;
  border: none;
  background: ${props => props.$isSelected ? '#2563eb' : 'none'};
  color: ${props => {
    if (props.$isSelected) return 'white';
    if (props.$isOtherMonth) return '#9ca3af';
    if (props.$isToday) return '#2563eb';
    return '#1a1a1a';
  }};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${props => props.$isSelected ? '#2563eb' : '#f3f4f6'};
  }

  ${props => props.$isDisabled && `
    cursor: not-allowed;
    background: #f3f4f6;
  `}
`;

const MonthYearSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

const MonthYearButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1a1a1a;
  }
`;

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, min, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateForDisplay = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date: Date) => {
    try {
      // Validate the date
      if (isNaN(date.getTime())) {
        console.error('Invalid date selected:', date);
        return;
      }

      // Check minimum date if provided
      if (min) {
        const minDate = new Date(min);
        if (date < minDate) {
          console.warn('Selected date is before minimum date');
          return;
        }
      }

      const formattedDate = formatDateForInput(date);
      console.log('Selected date:', {
        original: date,
        formatted: formattedDate
      });
      
      onChange(formattedDate);
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling date selection:', error);
    }
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const date = new Date(year, month, -i);
      days.unshift(
        <DatePickerCell
          key={`prev-${i}`}
          $isOtherMonth
          onClick={() => handleDateSelect(date)}
        >
          {date.getDate()}
        </DatePickerCell>
      );
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const isSelected = formatDateForInput(date) === value;
      const isToday = new Date().toDateString() === date.toDateString();
      const isDisabled = min ? date < new Date(min) : false;

      days.push(
        <DatePickerCell
          key={i}
          $isSelected={isSelected}
          $isToday={isToday}
          $isDisabled={isDisabled}
          onClick={() => !isDisabled && handleDateSelect(date)}
        >
          {i}
        </DatePickerCell>
      );
    }

    // Add days from next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push(
        <DatePickerCell
          key={`next-${i}`}
          $isOtherMonth
          onClick={() => handleDateSelect(date)}
        >
          {date.getDate()}
        </DatePickerCell>
      );
    }

    return days;
  };

  return (
    <DatePickerWrapper ref={wrapperRef}>
      <DatePickerInput
        type="text"
        value={value ? formatDateForDisplay(new Date(value)) : ''}
        onChange={() => {}}
        onClick={() => setIsOpen(true)}
        placeholder="DD/MM/YYYY"
        required={required}
        readOnly
      />
      <CalendarButton onClick={() => setIsOpen(!isOpen)}>
        <CalendarIcon size={16} />
      </CalendarButton>
      {isOpen && (
        <DatePickerDropdown>
          <DatePickerHeader>
            <MonthYearSelector>
              <MonthYearButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                <ChevronLeft size={16} />
              </MonthYearButton>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              <MonthYearButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                <ChevronRight size={16} />
              </MonthYearButton>
            </MonthYearSelector>
          </DatePickerHeader>
          <DatePickerGrid>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <DatePickerCell key={day} style={{ cursor: 'default', fontWeight: 500 }}>
                {day}
              </DatePickerCell>
            ))}
            {renderCalendarDays()}
          </DatePickerGrid>
        </DatePickerDropdown>
      )}
    </DatePickerWrapper>
  );
};

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  selectedDate?: Date;
}

const UNSPLASH_ACCESS_KEY = 'bjNofz1Fzm6AJBDW22g27x4IfsNkUn3zHfzDHpuVH5Y'; // You'll need to replace this with your actual Unsplash API key

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onEventCreated,
  selectedDate 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('17:00');
  const [image, setImage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    }
  }, [selectedDate]);

  const validateDates = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day

    if (startDate < now) {
      return 'Start date cannot be in the past';
    }

    if (endDate < startDate) {
      return 'End date must be after start date';
    }

    return null;
  };

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    
    // If end date is before new start date, update it
    if (endDate && newStartDate > endDate) {
      setEndDate(newStartDate);
    }

    // Validate dates
    const dateError = validateDates(newStartDate, endDate);
    setError(dateError);
  };

  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);

    // Validate dates
    const dateError = validateDates(startDate, newEndDate);
    setError(dateError);
  };

  const searchUnsplashImage = async (query: string): Promise<string> => {
    try {
      console.log('Searching Unsplash for:', query);
      
      // Check if electron API is available
      if (!window.electron?.searchUnsplash) {
        console.warn('Electron API not available, using fallback image');
        return 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
      }

      const imageUrl = await window.electron.searchUnsplash(query);
      console.log('Received image URL from main process:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const dateError = validateDates(startDate, endDate);
      if (dateError) {
        setError(dateError);
        setIsSubmitting(false);
        return;
      }

      // Log the raw input values
      console.log('Raw input values:', {
        startDate,
        startTime,
        endDate,
        endTime
      });

      // Parse dates and times separately to ensure valid values
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const [startHour, startMinute] = (startTime || '09:00').split(':').map(Number);
      
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      const [endHour, endMinute] = (endTime || '17:00').split(':').map(Number);

      // Log parsed components
      console.log('Parsed date components:', {
        start: { year: startYear, month: startMonth, day: startDay, hour: startHour, minute: startMinute },
        end: { year: endYear, month: endMonth, day: endDay, hour: endHour, minute: endMinute }
      });

      // Validate parsed components
      if (!startYear || !startMonth || !startDay || startHour === undefined || startMinute === undefined ||
          !endYear || !endMonth || !endDay || endHour === undefined || endMinute === undefined) {
        throw new Error('Invalid date or time components');
      }

      // Create Date objects with explicit values
      const startDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);
      const endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);

      // Log created Date objects
      console.log('Created Date objects:', {
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString()
      });

      // Validate the created dates
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        console.error('Invalid Date objects:', {
          startDateTime: startDateTime.toString(),
          endDateTime: endDateTime.toString()
        });
        throw new Error('Invalid date or time values');
      }

      // Create the event object first
      const newEvent = {
        title,
        description,
        location,
        startTime: startDateTime,
        endTime: endDateTime,
        image: image || 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        participants: []
      };

      // If no image URL provided, try to search for a relevant image
      if (!image) {
        try {
          console.log('No image URL provided, searching Unsplash...');
          const searchQuery = `${location} ${description}`.trim();
          if (searchQuery) {
            const imageUrl = await searchUnsplashImage(searchQuery);
            newEvent.image = imageUrl;
          }
        } catch (imageError) {
          console.error('Error fetching image from Unsplash:', imageError);
          // Continue with the default image
        }
      }

      console.log('Creating event with data:', {
        ...newEvent,
        startTime: newEvent.startTime.toISOString(),
        endTime: newEvent.endTime.toISOString()
      });

      await addEvent(newEvent);
      onEventCreated();
      onClose();
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Create New Event</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter event description"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Enter event location"
              required
            />
          </FormGroup>

          <DateTimeGroup>
            <FormGroup>
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                value={startDate}
                onChange={handleStartDateChange}
                min={formatDateForInput(new Date())}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="startTime">Start Time (optional)</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </FormGroup>
          </DateTimeGroup>

          <DateTimeGroup>
            <FormGroup>
              <Label htmlFor="endDate">End Date</Label>
              <DatePicker
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="endTime">End Time (optional)</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </FormGroup>
          </DateTimeGroup>

          <FormGroup>
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              type="url"
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="Enter image URL"
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={isSubmitting || !!error}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </SubmitButton>
        </Form>
      </Modal>
    </ModalOverlay>
  );
};

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

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

  const handleEventCreated = async () => {
    const loadedEvents = await getEvents();
    const processedEvents = loadedEvents.map(event => ({
      ...event,
      startTime: event.startTime instanceof Timestamp 
        ? event.startTime.toDate() 
        : new Date(event.startTime),
      endTime: event.endTime instanceof Timestamp 
        ? event.endTime.toDate() 
        : new Date(event.endTime)
    }));
    setEvents(processedEvents);
  };

  return (
    <CalendarContainer>
      <Header>
        <Title>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Title>
        <Controls>
          <IconButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
            <ChevronLeft size={20} />
          </IconButton>
          <Button onClick={() => {
            setSelectedDate(undefined);
            setIsCreateModalOpen(true);
          }}>
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

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
        selectedDate={selectedDate}
      />
    </CalendarContainer>
  );
};

export default Calendar; 