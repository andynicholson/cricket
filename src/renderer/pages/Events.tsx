import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MapPin, Calendar, Users, Clock, Plus } from 'react-feather';
import { getEvents } from '../../shared/firestore';
import type { Event } from '../../shared/types';
import { Timestamp } from 'firebase/firestore';

const EventsContainer = styled.div`
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

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const EventCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const EventImage = styled.div`
  height: 160px;
  background-color: #e5e7eb;
  background-image: url('https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
`;

const EventContent = styled.div`
  padding: 16px;
`;

const EventTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const EventDescription = styled.p`
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
`;

const EventFooter = styled.div`
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Participants = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
`;

const JoinButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #2563eb;
  background-color: white;
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2563eb;
    color: white;
  }
`;

const TimeRange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4b5563;
  font-size: 14px;
`;

const Duration = styled.span`
  color: #6b7280;
  font-size: 13px;
`;

const DateRange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4b5563;
  font-size: 14px;
`;

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const loadedEvents = await getEvents();
        console.log('Raw events from Firestore:', loadedEvents);
        // Convert Firestore Timestamps to Date objects and filter for upcoming events
        const now = new Date();
        const processedEvents = loadedEvents
          .map(event => ({
            ...event,
            startTime: event.startTime instanceof Timestamp 
              ? event.startTime.toDate() 
              : new Date(event.startTime),
            endTime: event.endTime instanceof Timestamp 
              ? event.endTime.toDate() 
              : new Date(event.endTime)
          }))
          .filter(event => event.startTime > now)
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()); // Sort by start time

        console.log('Processed upcoming events:', processedEvents);
        setEvents(processedEvents);
        setError(null);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <EventsContainer>
      <Header>
        <Title>Upcoming Events</Title>
        <Button>
          <Plus size={20} />
          Create Event
        </Button>
      </Header>

      <EventsGrid>
        {events.map(event => (
          <EventCard key={event.id}>
            <EventImage style={{ backgroundImage: `url(${event.image})` }} />
            <EventContent>
              <EventTitle>{event.title}</EventTitle>
              <EventDescription>{event.description}</EventDescription>
              <EventInfo>
                <InfoItem>
                  <Calendar size={16} />
                  <DateRange>
                    {isSameDay(event.startTime, event.endTime) 
                      ? formatDate(event.startTime)
                      : `${formatDate(event.startTime)} - ${formatDate(event.endTime)}`
                    }
                  </DateRange>
                </InfoItem>
                <InfoItem>
                  <Clock size={16} />
                  <TimeRange>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    <Duration>({formatDuration(event.startTime, event.endTime)})</Duration>
                  </TimeRange>
                </InfoItem>
                <InfoItem>
                  <MapPin size={16} />
                  {event.location}
                </InfoItem>
              </EventInfo>
            </EventContent>
            <EventFooter>
              <Participants>
                <Users size={16} />
                {Array.isArray(event.participants) ? event.participants.filter(p => p && p.trim() !== '').length : 0} {event.participants.filter(p => p && p.trim() !== '').length === 1 ? 'participant' : 'participants'}
              </Participants>
              <JoinButton>Join</JoinButton>
            </EventFooter>
          </EventCard>
        ))}
      </EventsGrid>
    </EventsContainer>
  );
};

export default Events; 