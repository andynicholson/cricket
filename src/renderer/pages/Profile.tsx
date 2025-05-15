import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Edit2, Map, Clock, Award, Activity } from 'react-feather';
import { useStrava } from '../hooks/useStrava';
import { stravaService } from '../services/stravaService';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 32px auto 0;
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.active ? '#2563eb' : '#e5e7eb'};
  border-radius: 6px;
  background-color: ${props => props.active ? '#2563eb' : 'white'};
  color: ${props => props.active ? 'white' : '#4b5563'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  color: #6b7280;
  font-size: 14px;
`;

const ActivityItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ActivityDetails = styled.div<{ expanded: boolean }>`
  display: ${props => props.expanded ? 'flex' : 'none'};
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const ActivityDescription = styled.div`
  color: #4b5563;
  line-height: 1.5;
`;

const ActivityStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
`;

const ActivityStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ActivityStatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`;

const ActivityStatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ActivityMap = styled.div`
  width: 100%;
  height: 200px;
  background-color: #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const ActivityAchievements = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Achievement = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  color: #4b5563;
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

const StatsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const StatsHeader = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 16px 0;
`;

const WeeklyStats = styled.div`
  background-color: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
`;

const WeeklyStatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

interface AthleteStats {
  all_run_totals: {
    distance: number;
    moving_time: number;
    count: number;
    elevation_gain: number;
  };
  ytd_run_totals: {
    distance: number;
    moving_time: number;
    count: number;
    elevation_gain: number;
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
  description?: string;
  kudos_count?: number;
  achievement_count?: number;
  total_elevation_gain?: number;
  achievements?: Array<{
    type: string;
    rank?: number;
  }>;
}

const Profile: React.FC = () => {
  const { isAuthenticated, athlete, accessToken, login, logout } = useStrava();
  const [stats, setStats] = useState<AthleteStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<{ runs: number; distance: number; time: number; elevation: number }>({ runs: 0, distance: 0, time: 0, elevation: 0 });
  const [threeMonthAverages, setThreeMonthAverages] = useState<{ runs: number; distance: number; time: number; elevation: number }>({ runs: 0, distance: 0, time: 0, elevation: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 10;
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [activityDetails, setActivityDetails] = useState<Record<number, Activity>>({});

  // Add a debug effect to log state changes
  useEffect(() => {
    console.log('Profile state changed:', {
      isAuthenticated,
      hasAthlete: !!athlete,
      hasAccessToken: !!accessToken,
      athleteId: athlete?.id,
      athleteName: athlete ? `${athlete.firstname} ${athlete.lastname}` : null
    });
  }, [isAuthenticated, athlete, accessToken]);

  useEffect(() => {
    console.log('Profile useEffect triggered with:', {
      isAuthenticated,
      hasAthlete: !!athlete,
      hasAccessToken: !!accessToken,
      athleteId: athlete?.id,
      athleteName: athlete ? `${athlete.firstname} ${athlete.lastname}` : null
    });

    const fetchData = async () => {
      if (isAuthenticated && accessToken && athlete) {
        console.log('Fetching Strava data for athlete:', athlete.id);
        try {
          const [statsData, activitiesData] = await Promise.all([
            stravaService.getAthleteStats(accessToken, athlete.id),
            stravaService.getRecentActivities(accessToken, 100)
          ]);
          
          console.log('Received Strava data:', {
            stats: statsData,
            activities: activitiesData
          });

          setStats(statsData);
          setRecentActivities(activitiesData);
          setCurrentPage(1);

          // Calculate weekly stats
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const weeklyActivities = activitiesData.filter((activity: Activity) => 
            new Date(activity.start_date) >= oneWeekAgo && 
            activity.type === 'Run'
          );

          const calculatedWeeklyStats = weeklyActivities.reduce((acc: { runs: number; distance: number; time: number; elevation: number }, activity: Activity) => ({
            runs: acc.runs + 1,
            distance: acc.distance + activity.distance,
            time: acc.time + activity.moving_time,
            elevation: acc.elevation + (activity.total_elevation_gain || 0)
          }), { runs: 0, distance: 0, time: 0, elevation: 0 });

          setWeeklyStats(calculatedWeeklyStats);

          // Calculate 3-month averages
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          
          const threeMonthActivities = activitiesData.filter((activity: Activity) => 
            new Date(activity.start_date) >= threeMonthsAgo && 
            activity.type === 'Run'
          );

          const threeMonthTotals = threeMonthActivities.reduce((acc: { runs: number; distance: number; time: number; elevation: number }, activity: Activity) => ({
            runs: acc.runs + 1,
            distance: acc.distance + activity.distance,
            time: acc.time + activity.moving_time,
            elevation: acc.elevation + (activity.total_elevation_gain || 0)
          }), { runs: 0, distance: 0, time: 0, elevation: 0 });

          // Calculate weekly averages (divide by ~13 weeks)
          const weeklyAverages = {
            runs: Math.round(threeMonthTotals.runs / 13),
            distance: threeMonthTotals.distance / 13,
            time: threeMonthTotals.time / 13,
            elevation: threeMonthTotals.elevation / 13
          };

          setThreeMonthAverages(weeklyAverages);
        } catch (error) {
          console.error('Error fetching Strava data:', error);
        }
      } else {
        console.log('Not fetching data because:', {
          isAuthenticated,
          hasAccessToken: !!accessToken,
          hasAthlete: !!athlete
        });
      }
    };

    fetchData();
  }, [isAuthenticated, athlete, accessToken]);

  // Calculate pagination values
  const totalPages = Math.ceil(recentActivities.length / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = recentActivities.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleActivityClick = async (activityId: number) => {
    if (expandedActivity === activityId) {
      setExpandedActivity(null);
      return;
    }

    setExpandedActivity(activityId);

    // If we don't have the details yet, fetch them
    if (!activityDetails[activityId] && accessToken) {
      try {
        const data = await stravaService.getActivityDetails(accessToken, activityId);
        setActivityDetails(prev => ({
          ...prev,
          [activityId]: data
        }));
      } catch (error) {
        console.error('Error fetching activity details:', error);
      }
    }
  };

  const formatElevation = (meters: number) => {
    return `${Math.round(meters)}m`;
  };

  const renderActivityDetails = (activity: Activity) => {
    const details = activityDetails[activity.id] || activity;
    
    return (
      <ActivityDetails expanded={expandedActivity === activity.id}>
        {details.description && (
          <ActivityDescription>{details.description}</ActivityDescription>
        )}
        
        <ActivityStats>
          <ActivityStat>
            <ActivityStatValue>{details.kudos_count || 0}</ActivityStatValue>
            <ActivityStatLabel>Kudos</ActivityStatLabel>
          </ActivityStat>
          <ActivityStat>
            <ActivityStatValue>{details.achievement_count || 0}</ActivityStatValue>
            <ActivityStatLabel>Achievements</ActivityStatLabel>
          </ActivityStat>
          <ActivityStat>
            <ActivityStatValue>{formatElevation(details.total_elevation_gain || 0)}</ActivityStatValue>
            <ActivityStatLabel>Elevation Gain</ActivityStatLabel>
          </ActivityStat>
        </ActivityStats>

        {details.achievements && details.achievements.length > 0 && (
          <ActivityAchievements>
            {details.achievements.map((achievement, index) => (
              <Achievement key={index}>
                {achievement.type}
                {achievement.rank && ` (${achievement.rank})`}
              </Achievement>
            ))}
          </ActivityAchievements>
        )}
      </ActivityDetails>
    );
  };

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

  const renderStats = (title: string, stats: { distance: number; moving_time: number; count: number; elevation_gain: number }) => (
    <StatsSection>
      <StatsTitle>{title}</StatsTitle>
      <Stats>
        <StatCard>
          <StatValue>{formatDistance(stats.distance)}</StatValue>
          <StatLabel>Total Distance</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{formatTime(stats.moving_time)}</StatValue>
          <StatLabel>Total Time</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.count}</StatValue>
          <StatLabel>Total Activities</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{formatElevation(stats.elevation_gain)}</StatValue>
          <StatLabel>Total Elevation</StatLabel>
        </StatCard>
      </Stats>
    </StatsSection>
  );

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
            {`${athlete?.firstname || ''} ${athlete?.lastname || ''}`}
            <EditButton onClick={logout}>
              Disconnect
            </EditButton>
          </Name>
          <Bio>
            Connected with Strava • {athlete?.city || 'Unknown'}, {athlete?.country || 'Unknown'}
          </Bio>
        </ProfileInfo>
      </ProfileHeader>

      {stats && (
        <>
          <StatsHeader>Running Statistics</StatsHeader>
          
          <WeeklyStats>
            <WeeklyStatCard>
              <StatValue>{weeklyStats.runs}</StatValue>
              <StatLabel>Runs This Week</StatLabel>
            </WeeklyStatCard>
            <WeeklyStatCard>
              <StatValue>{formatDistance(weeklyStats.distance)}</StatValue>
              <StatLabel>Distance This Week</StatLabel>
            </WeeklyStatCard>
            <WeeklyStatCard>
              <StatValue>{formatElevation(weeklyStats.elevation)}</StatValue>
              <StatLabel>Elevation This Week</StatLabel>
            </WeeklyStatCard>
          </WeeklyStats>

          <WeeklyStats>
            <WeeklyStatCard>
              <StatValue>{threeMonthAverages.runs}</StatValue>
              <StatLabel>Average Runs/Week</StatLabel>
            </WeeklyStatCard>
            <WeeklyStatCard>
              <StatValue>{formatDistance(threeMonthAverages.distance)}</StatValue>
              <StatLabel>Average Distance/Week</StatLabel>
            </WeeklyStatCard>
            <WeeklyStatCard>
              <StatValue>{formatElevation(threeMonthAverages.elevation)}</StatValue>
              <StatLabel>Average Elevation/Week</StatLabel>
            </WeeklyStatCard>
          </WeeklyStats>

          {renderStats('Year to Date', stats.ytd_run_totals)}
          {renderStats('All Time', stats.all_run_totals)}
        </>
      )}

      <RecentActivity>
        <SectionTitle>Recent Activity</SectionTitle>
        <ActivityList>
          {currentActivities && currentActivities.length > 0 ? (
            currentActivities.map(activity => (
              <ActivityItem key={activity.id} onClick={() => handleActivityClick(activity.id)}>
                <ActivityHeader>
                  <ActivityIcon>
                    <Activity size={20} />
                  </ActivityIcon>
                  <ActivityInfo>
                    <ActivityTitle>{activity.name}</ActivityTitle>
                    <ActivityMeta>
                      {formatDistance(activity.distance)} • {formatTime(activity.moving_time)} • {formatDate(activity.start_date)}
                    </ActivityMeta>
                  </ActivityInfo>
                </ActivityHeader>
                {renderActivityDetails(activity)}
              </ActivityItem>
            ))
          ) : (
            <ActivityItem>
              <ActivityInfo>
                <ActivityTitle>No recent activities</ActivityTitle>
                <ActivityMeta>Connect your Strava account to see your activities</ActivityMeta>
              </ActivityInfo>
            </ActivityItem>
          )}
        </ActivityList>
        
        {recentActivities.length > 0 && (
          <PaginationContainer>
            <PageButton 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </PageButton>
            <PageInfo>
              Page {currentPage} of {totalPages}
            </PageInfo>
            <PageButton 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </PageButton>
          </PaginationContainer>
        )}
      </RecentActivity>
    </ProfileContainer>
  );
};

export default Profile; 