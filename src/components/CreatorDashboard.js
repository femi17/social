import React, { useState, useEffect } from 'react';
import { BookOpen, Table, Users, Sun, Cloud, Snowflake, Leaf } from 'lucide-react';
import { fetchUserDetails, fetchUserLeagueInfo, fetchLeagueTable, fetchNextMatch, fetchCreatorFollowersCount } from '../apiUtils';
import { useNavigate } from 'react-router-dom';
import ProfilePicture from './ProfilePicture';
import NextMatch from './NextMatch';
import ContentUpload from './ContentUpload';
import Navigation from './Navigation';

const CreatorDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [nextMatch, setNextMatch] = useState(null);
  const [divisionTable, setDivisionTable] = useState([]);
  const [divisionName, setDivisionName] = useState('');
  const [error, setError] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userDetailsData = await fetchUserDetails();
        setUserDetails(userDetailsData);

        const leagueInfoData = await fetchUserLeagueInfo();
        setLeagueInfo(leagueInfoData);

        if (leagueInfoData && leagueInfoData.league) {
          try {
            const tableData = await fetchLeagueTable(leagueInfoData.league.id);
            setDivisionTable(tableData.table);
            setDivisionName(tableData.division_name);
          } catch (error) {
            console.error('Failed to fetch division table:', error);
          }

          try {
            const nextMatchData = await fetchNextMatch(userDetailsData.id);
            setNextMatch(nextMatchData);
          } catch (error) {
            console.error('Failed to fetch next match:', error);
          }

          try {
            const followersCountData = await fetchCreatorFollowersCount(userDetailsData.id);
            setFollowersCount(followersCountData);
          } catch (error) {
            console.error('Failed to fetch followers count:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError(error.message || 'An error occurred while fetching data');
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeToDrawdown = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0'); // Ensure whole seconds

    return `${days} days, ${hours} hours, ${minutes} minutes, ${remainingSeconds} seconds`;
};
 

const getSeasonIcon = (season) => {
  switch(season) {
    case 'SPRING':
      return <Cloud className="text-blue-400" />;
    case 'SUMMER':
      return <Sun className="text-yellow-400" />;
    case 'FALL':
      return <Leaf className="text-orange-400" size={14} />;
    case 'WINTER':
      return <Snowflake className="text-blue-200" />;
    default:
      return null;
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white-900 text-white">  
      <Navigation 
        userDetails={userDetails}
        ProfilePicture={ProfilePicture}
      />

      <main className="p-4 max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="bg-800 mb-6 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {leagueInfo && (
              <div className="bg-gray-800 flex-grow p-4 sm:p-6 rounded-lg mb-4 lg:mb-0 lg:mr-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {leagueInfo.league.name} 
                    </h2>
                    <span className="text-gray-400 text-xs ml-2 flex items-center">
                      {getSeasonIcon(leagueInfo.league.current_season)} 
                      <span className="ml-1">
                        {leagueInfo.league.current_season} {leagueInfo.league.season_year}
                      </span>
                    </span>
                  </div>
                  {leagueInfo.time_to_draw > 0 && (
                    <span className="text-yellow-400 text-sm">
                      Live draw: {formatTimeToDrawdown(leagueInfo.time_to_draw)}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mb-4 text-sm">{leagueInfo.league.description || 'No description available.'}</p>
                <p className="text-gray-400 mb-4 text-sm">League Status: {leagueInfo.league.status}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="font-semibold">Start Date</p>
                    <p className="text-gray-400 text-sm">{formatDate(leagueInfo.league.start_date)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">End Date</p>
                    <p className="text-gray-400 text-sm">{formatDate(leagueInfo.league.end_date)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Draw Date</p>
                    <p className="text-gray-400 text-sm">{formatDate(leagueInfo.league.draw_date)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Total Participants</p>
                    <p className="text-gray-400 text-sm">{leagueInfo.total_participants}/{leagueInfo.league.capacity}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mt-4">
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                    onClick={() => navigate('/league-rules')}
                  >
                    <BookOpen className="h-5 w-5 mr-2" /> View League Rules
                  </button>
                  {leagueInfo.time_to_draw > 0 && (
                    <button
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto"
                      onClick={() => navigate(`/live-draw/${leagueInfo.league.id}`)}
                    >
                      <Users className="h-5 w-5 mr-2" /> Join Live Draw
                    </button>
                  )}
                </div>
              </div>
            )}

            {nextMatch ? (
              <NextMatch
                nextMatch={nextMatch}
                leagueInfo={leagueInfo}
                navigate={navigate}
              />
            ) : (
              <div className="lg:w-5/12 p-4 sm:p-6 bg-gray-800 rounded-lg">
                <h2 className="text-center text-cyan-400 font-semibold mb-2">NEXT MATCH</h2>
                <p className="text-center text-gray-400 mb-2">No upcoming matches scheduled.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg col-span-1 lg:col-span-2">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center">
              <Table className="mr-2" size={20} /> {divisionName} Table
            </h2>
            {divisionTable.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-400 border-b border-gray-700 sticky top-0 bg-gray-800">
                        <tr>
                          <th className="text-left py-2 px-4">POS</th>
                          <th className="text-left py-2 px-4">CREATOR</th>
                          <th className="text-right py-2 px-4">P</th>
                          <th className="text-right py-2 px-4">W</th>
                          <th className="text-right py-2 px-4">D</th>
                          <th className="text-right py-2 px-4">L</th>
                          <th className="text-right py-2 px-4">GF</th>
                          <th className="text-right py-2 px-4">GA</th>
                          <th className="text-right py-2 px-4">GD</th>
                          <th className="text-right py-2 px-4">PTS</th>
                        </tr>
                      </thead>
                      <tbody>
                      {divisionTable.map((row) => (
                        <tr key={row.creator.id} className={`${row.creator.id === userDetails.id ? 'bg-green-500' : ''}`}>
                          <td className="py-2 px-4">{row.position}</td>
                          <td className="py-2 px-4 capitalize">{row.creator.username}</td>
                          <td className="text-right py-2 px-4">{row.played}</td>
                          <td className="text-right py-2 px-4">{row.won}</td>
                          <td className="text-right py-2 px-4">{row.drawn}</td>
                          <td className="text-right py-2 px-4">{row.lost}</td>
                          <td className="text-right py-2 px-4">{row.gf}</td>
                          <td className="text-right py-2 px-4">{row.ga}</td>
                          <td className="text-right py-2 px-4">{row.gd}</td>
                          <td className="text-right py-2 px-4">{row.points}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mt-8 text-sm sm:text-base"
                  onClick={() => navigate(`/league-details/${leagueInfo.league.id}/${userDetails.id}`)}
                >
                  <Table className="inline-block mr-2" size={16} /> See League Details
                </button>
              </>
            ) : (
              <p>No league table data available yet.</p>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                <Users className="mr-2" size={20} /> Followers
              </h3>
              <p className="text-2xl sm:text-3xl font-bold">{followersCount}</p>
              <p className="text-sm text-gray-400">Followers Inspired</p>
            </div>
            <ContentUpload userId={userDetails.id} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatorDashboard;