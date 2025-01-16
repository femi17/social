import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, ArrowRight, BookOpen, Users, Trophy } from 'lucide-react';
import { fetchUserDetails, fetchUserLeagueInfo, fetchFollowedCreators, fetchCreatorNextMatch, fetchVotingHistory, fetchLeagues, fetchCreatorsInLeague, followCreator, fetchCreatorStats, unfollowCreator } from '../apiUtils';
import Navigation from './Navigation';
import ProfilePicture from './ProfilePicture';
import VotingHistory from './VotingHistory';

const FanDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [followedCreators, setFollowedCreators] = useState([]);
  const [currentCreatorIndex, setCurrentCreatorIndex] = useState(0);
  const [nextMatch, setNextMatch] = useState(null);
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [creatorsInLeague, setCreatorsInLeague] = useState([]);
  const [creatorStats, setCreatorStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDetailsData, leagueInfo, creatorsData, leaguesData, votingHistoryData] = await Promise.all([
          fetchUserDetails(),
          fetchUserLeagueInfo(),
          fetchFollowedCreators(),
          fetchLeagues(),
          fetchVotingHistory()
        ]);
        setUserDetails(userDetailsData);
        setLeagueInfo(leagueInfo);
        setFollowedCreators(creatorsData);
        setLeagues(leaguesData);
        setVotingHistory(votingHistoryData);

        console.log("Followed Creators:", creatorsData);

        if (creatorsData.length > 0) {
          const [matchData, statsData] = await Promise.all([
            fetchCreatorNextMatch(creatorsData[0].id),
            fetchCreatorStats(creatorsData[0].id)
          ]);

          setCreatorStats(statsData);

          if (matchData) {
            setNextMatch(matchData);

            const opponentId = matchData.home_creator.id === creatorsData[0].id
              ? matchData.away_creator.id
              : matchData.home_creator.id;

            const opponentStats = await fetchCreatorStats(opponentId);

            setNextMatch(prevMatch => ({
              ...prevMatch,
              home_creator: {
                ...prevMatch.home_creator,
                leaguePosition: prevMatch.home_creator.id === creatorsData[0].id
                  ? statsData.leaguePosition
                  : opponentStats.leaguePosition
              },
              away_creator: {
                ...prevMatch.away_creator,
                leaguePosition: prevMatch.away_creator.id === creatorsData[0].id
                  ? statsData.leaguePosition
                  : opponentStats.leaguePosition
              }
            }));
          } else {
            setNextMatch(null);
          }
        } else {
          setCreatorStats(null);
          setNextMatch(null);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load dashboard data. Please try again.');
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchCreators = async () => {
      if (selectedLeague) {
        try {
          const creators = await fetchCreatorsInLeague(selectedLeague);
          setCreatorsInLeague(creators);
        } catch (error) {
          console.error('Error fetching creators:', error);
        }
      }
    };
    fetchCreators();
  }, [selectedLeague]);

  const handleFollowCreator = async (creatorId) => {
    try {
      await followCreator(creatorId);
      const followedData = await fetchFollowedCreators();
      setFollowedCreators(followedData);
      setSelectedLeague('');
      setCreatorsInLeague([]);
      alert('Successfully followed the creator!');
    } catch (error) {
      console.error('Error following creator:', error);
      alert(error.message || 'Failed to follow creator. Please try again.');
    }
  };

  const handleUnfollowCreator = async (creatorId) => {
    try {
      await unfollowCreator(creatorId);
      const followedData = await fetchFollowedCreators();
      setFollowedCreators(followedData);
      alert('Successfully unfollowed the creator!');
    } catch (error) {
      console.error('Error unfollowing creator:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to unfollow creator. Please try again.');
      }
    }
  };

  const handleCreatorChange = async (direction) => {
    const newIndex = direction === 'next'
      ? (currentCreatorIndex + 1) % followedCreators.length
      : (currentCreatorIndex - 1 + followedCreators.length) % followedCreators.length;
    
    setCurrentCreatorIndex(newIndex);
    
    try {
      const [matchData, statsData] = await Promise.all([
        fetchCreatorNextMatch(followedCreators[newIndex].id),
        fetchCreatorStats(followedCreators[newIndex].id)
      ]);
      setNextMatch(matchData);
      setCreatorStats(statsData);
  
      if (matchData) {
        const opponentId = matchData.home_creator.id === followedCreators[newIndex].id 
          ? matchData.away_creator.id 
          : matchData.home_creator.id;
        const opponentStats = await fetchCreatorStats(opponentId);
        setNextMatch(prevMatch => ({
          ...prevMatch,
          home_creator: {
            ...prevMatch.home_creator,
            leaguePosition: prevMatch.home_creator.id === followedCreators[newIndex].id 
              ? statsData.leaguePosition 
              : opponentStats.leaguePosition
          },
          away_creator: {
            ...prevMatch.away_creator,
            leaguePosition: prevMatch.away_creator.id === followedCreators[newIndex].id 
              ? statsData.leaguePosition 
              : opponentStats.leaguePosition
          }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch creator data:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getDaysRemaining = (matchDate) => {
    if (!matchDate) return null;
    const now = new Date();
    const match = new Date(matchDate);

    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const matchDateOnly = new Date(match.getFullYear(), match.getMonth(), match.getDate());

    const diffTime = Math.abs(matchDateOnly - nowDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nowDate.getTime() === matchDateOnly.getTime()) {
      return "Today";
    }

    return diffDays;
  };

  const getPositionSuffix = (position) => {
    if (position % 100 >= 11 && position % 100 <= 13) {
      return 'th';
    }
    switch (position % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const renderPosition = (creator) => {
    if (creator && creator.leaguePosition) {
      return (
        <p className="text-sm font-semibold text-white">
          {creator.leaguePosition}{getPositionSuffix(creator.leaguePosition)}
        </p>
      );
    }
    return null;
  };

  const formatTimeToDrawdown = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');

    return `${days} days, ${hours} hours, ${minutes} minutes, ${remainingSeconds} seconds`;
  };

  if (loading) {
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

  const currentCreator = followedCreators[currentCreatorIndex];
  const daysRemaining = nextMatch ? getDaysRemaining(nextMatch.scheduled_time) : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation userDetails={userDetails} ProfilePicture={ProfilePicture} />
  
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
              {/* League Info Section */}
              <h2 className="text-xl text-white font-bold mb-4">League Info</h2>
              {leagueInfo && (
                <div className="bg-gray-800 flex-grow p-4 sm:p-6 rounded-lg mb-4 lg:mb-0 lg:mr-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-xl sm:text-2xl text-white  font-bold mb-2 sm:mb-0">
                      {leagueInfo.league.name}
                    </h2>
                    {leagueInfo.time_to_draw > 0 && (
                      <span className="text-yellow-400 text-sm">
                        Live draw: {formatTimeToDrawdown(leagueInfo.time_to_draw)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 mb-4 text-sm">
                    {leagueInfo.league.description || 'No description available.'}
                  </p>
                  <p className="text-gray-400 mb-4 text-white  text-sm">League Status: {leagueInfo.league.status}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="font-semibold text-white ">Start Date</p>
                      <p className="text-gray-400 text-sm">{formatDate(leagueInfo.league.start_date)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white ">End Date</p>
                      <p className="text-gray-400 text-sm">{formatDate(leagueInfo.league.end_date)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white ">Draw Date</p>
                      <p className="text-gray-400 text-sm">{formatDate(leagueInfo.league.draw_date)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white ">Total Participants</p>
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
            </div>
    
            <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg">
              {/* Follow Creator Section */}
              <h2 className="text-xl text-white font-bold mb-4">Follow Creator</h2>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="block w-full mt-1 rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select a league</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>{league.name}</option>
                ))}
                </select>
  
                {selectedLeague && (
                  <div className="mt-4 overflow-y-auto" style={{ maxHeight: '200px' }}>
                    <h3 className="text-xl font-semibold mb-2 text-white">Creators in {leagues.find(l => l.id === parseInt(selectedLeague))?.name}</h3>
                    <ul className="space-y-2">
                      {creatorsInLeague.map((creator) => (
                        <li key={creator.id} className="flex justify-between items-center">
                          <span className="text-white">{creator.username}</span>
                          <button 
                            onClick={() => handleFollowCreator(creator.id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            Follow
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
  
            <div className="mt-6"></div>
    
            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                {/* Creator Stats Section */}
                <h2 className="text-xl text-white font-bold mb-4">Creator Stats</h2>
                {followedCreators.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => handleCreatorChange('prev')} className="p-2 text-white">
                        <ArrowLeft />
                      </button>
                      <h3 className="text-xl font-bold text-white">{currentCreator.username}</h3>
                      <button onClick={() => handleCreatorChange('next')} className="p-2 text-white">
                        <ArrowRight />
                      </button>
                    </div>
  
                    {/* Creator Stats */}
                    <div className="flex flex-col items-center justify-center">
                      {creatorStats && (
                        <div className="mt-6 bg-gray-700 p-4 rounded-lg w-full">
                          <h4 className="text-lg font-semibold mb-2 text-white">{currentCreator.username} Stats</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">League Position</p>
                              <p className="text-lg font-bold text-white">{creatorStats && renderPosition(creatorStats)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Total Points</p>
                              <p className="text-lg font-bold text-white">{creatorStats.totalPoints}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Wins</p>
                              <p className="text-lg font-bold text-white">{creatorStats.wins}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Losses</p>
                              <p className="text-lg font-bold text-white">{creatorStats.losses}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Draws</p>
                              <p className="text-lg font-bold text-white">{creatorStats.draws}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Goal Difference</p>
                              <p className="text-lg font-bold text-white">{creatorStats.goalDifference}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-white">You are not following any creators yet. Explore leagues to find creators to follow!</p>
                )}
              </div>
  
              <div className="bg-gray-800 p-6 rounded-lg">
                {/* Next Match Details Section */}
                <h2 className="text-xl text-white font-bold mb-4">
                  {followedCreators.length > 0 ? `${currentCreator.username} Next Match Details` : "Next Match Details"}
                </h2>
                {followedCreators.length > 0 ? (
                  nextMatch ? (
                    <div className="p-6 bg-gray-800 rounded-lg">
                      <h2 className="text-center text-cyan-400 font-semibold mb-2">NEXT MATCH</h2>
                      <p className="text-center text-gray-400 mb-2">
                        {formatDate(nextMatch.scheduled_time)} ({daysRemaining === "Today" ? daysRemaining : `${daysRemaining} days`})
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                          <ProfilePicture user={nextMatch.home_creator} size="large" />
                          {nextMatch?.league && renderPosition(nextMatch.home_creator)}
                        </div>
  
                        <div className="text-center mx-4">
                          <p className="text-xl font-bold text-gray-400">{nextMatch?.league ? nextMatch.league : nextMatch?.name || ""}</p>
                          <p className="text-xl font-bold text-white capitalize">
                            {nextMatch.home_creator.username} v {nextMatch.away_creator.username}
                          </p>
                          <div className="flex justify-center items-center mt-2 space-x-2">
                          {nextMatch?.division ? (
                            <>
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">{nextMatch.division}</span>
                            </>
                          ) : (
                            <>
                              <Trophy className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">{nextMatch.round}</span>
                            </>
                          )}
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">{formatTime(nextMatch.scheduled_time)}</span>
                          </div>
                        </div>
  
                        <div className="text-center">
                          <ProfilePicture user={nextMatch.away_creator} size="large" />
                          {nextMatch.league && renderPosition(nextMatch.away_creator)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white">No upcoming matches scheduled.</p>
                  )
                ) : (
                  <p className="text-white">Follow a creator to see their upcoming matches.</p>
                )}
              </div>
            </div>
  
            <div className="mt-6"></div>
     
            {/* Third Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VotingHistory votingHistory={votingHistory} />
      
              <div className="bg-gray-800 p-6 rounded-lg">
                {/* Unfollow Section */}
                <h2 className="text-xl text-white font-bold mb-4">Unfollow Creator</h2>
                {followedCreators.map((creator) => (
                  <div key={creator.id} className="mb-4 p-4 bg-gray-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <ProfilePicture user={creator} size="medium" />
                      <span className="ml-4 text-white text-lg">{creator.username}</span>
                    </div>
                    <button 
                      onClick={() => handleUnfollowCreator(creator.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      Unfollow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };
  
  export default FanDashboard;