import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Edit2, Map, Clock, Award, Activity } from 'react-feather';
import { useStrava } from '../contexts/StravaContext';
import { stravaService } from '../services/stravaService';

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

interface AthleteStats {
  all_run_totals: {
    distance: number;
    moving_time: number;
    count: number;
  };
  recent_run_totals: {
    count: number;
  };
}

interface Activity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  start_date: string;
  type: string;
}

const Profile: React.FC = () => {
  const { isAuthenticated, athlete, accessToken, login, logout } = useStrava();
  const [stats, setStats] = useState<AthleteStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && accessToken && athlete) {
        try {
          const [statsData, activitiesData] = await Promise.all([
            stravaService.getAthleteStats(accessToken, athlete.id),
            stravaService.getRecentActivities(accessToken, 3)
          ]);
          
          setStats(statsData);
          setRecentActivities(activitiesData);
        } catch (error) {
          console.error('Error fetching Strava data:', error);
          logout();
        }
      }
    };

    fetchData();
  }, [isAuthenticated, accessToken, athlete, logout]);

  if (!isAuthenticated) {
    return (
      <ProfileContainer>
        <ProfileHeader>
          <ProfileInfo>
            <Name>Connect with Strava</Name>
            <Bio>
              Connect your Strava account to view your running statistics and recent activities.
            </Bio>
            <EditButton onClick={login}>
              Connect with Strava
            </EditButton>
          </ProfileInfo>
        </ProfileHeader>
      </ProfileContainer>
    );
  }

  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const statsData = stats ? [
    { label: 'Total Distance', value: formatDistance(stats.all_run_totals.distance), icon: Map },
    { label: 'Total Time', value: formatTime(stats.all_run_totals.moving_time), icon: Clock },
    { label: 'Runs Completed', value: stats.all_run_totals.count.toString(), icon: Award },
    { label: 'Recent Runs', value: stats.recent_run_totals.count.toString(), icon: Activity },
  ] : [];

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar>
          {athlete?.profile_medium ? (
            <img src={athlete.profile_medium} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          ) : (
            `${athlete?.firstname?.[0]}${athlete?.lastname?.[0]}`
          )}
        </Avatar>
        <ProfileInfo>
          <Name>
            {`${athlete?.firstname} ${athlete?.lastname}`}
            <EditButton onClick={logout}>
              Disconnect
            </EditButton>
          </Name>
          <Bio>
            Connected with Strava • {athlete?.city}, {athlete?.country}
          </Bio>
        </ProfileInfo>
      </ProfileHeader>

      <Stats>
        {statsData.map((stat, index) => (
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
                <Activity size={20} />
              </ActivityIcon>
              <ActivityInfo>
                <ActivityTitle>{activity.name}</ActivityTitle>
                <ActivityMeta>
                  {formatDistance(activity.distance)} • {formatTime(activity.moving_time)} • {formatDate(activity.start_date)}
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