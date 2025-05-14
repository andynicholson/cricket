import React from 'react';
import styled from 'styled-components';
import { MapPin, Calendar, Users, Clock, Plus } from 'react-feather';

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

const Events: React.FC = () => {
  // Mock data for demonstration
  const events = [
    {
      id: 1,
      title: 'Morning Trail Run',
      date: 'March 20, 2024',
      time: '06:00 AM',
      location: 'Redwood Regional Park',
      participants: 12,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 2,
      title: 'Weekend Long Run',
      date: 'March 23, 2024',
      time: '08:00 AM',
      location: 'Mount Tamalpais',
      participants: 8,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 3,
      title: 'Race Planning Meeting',
      date: 'March 25, 2024',
      time: '07:00 PM',
      location: 'Trail Runner\'s Cafe',
      participants: 5,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

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
            <EventImage />
            <EventContent>
              <EventTitle>{event.title}</EventTitle>
              <EventInfo>
                <InfoItem>
                  <Calendar size={16} />
                  {event.date}
                </InfoItem>
                <InfoItem>
                  <Clock size={16} />
                  {event.time}
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
                {event.participants} participants
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