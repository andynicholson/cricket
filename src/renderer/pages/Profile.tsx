import React from 'react';
import styled from 'styled-components';
import { Edit2, Map, Clock, Award, Activity } from 'react-feather';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 24px;
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 600;
  color: #4b5563;
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Name = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EditButton = styled.button`
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

const Bio = styled.p`
  color: #4b5563;
  line-height: 1.5;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`;

const StatCard = styled.div`
  background-color: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`;

const RecentActivity = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9fafb;
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 500;
  color: #1a1a1a;
`;

const ActivityMeta = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const Profile: React.FC = () => {
  // Mock data for demonstration
  const stats = [
    { label: 'Total Distance', value: '1,234 km', icon: Map },
    { label: 'Total Time', value: '156 hrs', icon: Clock },
    { label: 'Races Completed', value: '12', icon: Award },
    { label: 'Personal Bests', value: '8', icon: Activity },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Morning Trail Run',
      distance: '10.5 km',
      time: '1h 15m',
      date: 'March 20, 2024',
      icon: Activity,
    },
    {
      id: 2,
      title: 'Weekend Long Run',
      distance: '25 km',
      time: '2h 45m',
      date: 'March 18, 2024',
      icon: Activity,
    },
    {
      id: 3,
      title: 'Race: Mountain Trail Challenge',
      distance: '42 km',
      time: '4h 30m',
      date: 'March 15, 2024',
      icon: Award,
    },
  ];

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar>JD</Avatar>
        <ProfileInfo>
          <Name>
            John Doe
            <EditButton>
              <Edit2 size={20} />
            </EditButton>
          </Name>
          <Bio>
            Trail runner and ultra marathon enthusiast. Love exploring new trails and
            challenging myself with longer distances. Always up for a group run!
          </Bio>
        </ProfileInfo>
      </ProfileHeader>

      <Stats>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <stat.icon size={24} />
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </Stats>

      <RecentActivity>
        <SectionTitle>Recent Activity</SectionTitle>
        <ActivityList>
          {recentActivities.map(activity => (
            <ActivityItem key={activity.id}>
              <ActivityIcon>
                <activity.icon size={20} />
              </ActivityIcon>
              <ActivityInfo>
                <ActivityTitle>{activity.title}</ActivityTitle>
                <ActivityMeta>
                  {activity.distance} • {activity.time} • {activity.date}
                </ActivityMeta>
              </ActivityInfo>
            </ActivityItem>
          ))}
        </ActivityList>
      </RecentActivity>
    </ProfileContainer>
  );
};

export default Profile; 