import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, Loader, ChevronDown } from 'lucide-react';
import { fetchLeagueDetails, fetchUserDetails, fetchMatches, fetchChampionshipDetails } from '../apiUtils';
import Navigation from './Navigation';
import ProfilePicture from './ProfilePicture';
import favicon from '../assets/favicon.png';

const LeagueDetails = () => {
  const [leagueDetails, setLeagueDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [currentDivisionIndex, setCurrentDivisionIndex] = useState(0);
  const [selectedDateString, setSelectedDateString] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [matchType, setMatchType] = useState('all');
  const [championshipDetails, setChampionshipDetails] = useState(null);
  const [championshipName, setChampionshipName] = useState('');
  const [selectedRound, setSelectedRound] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { leagueId } = useParams();
  const navigate = useNavigate();

  const getPositionSuffix = useCallback((position) => {
    if (position % 100 >= 11 && position % 100 <= 13) {
      return 'th';
    }
    switch (position % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }, []);

  const renderPosition = useCallback((creator) => {
    if (creator && creator.position) {
      return (
        <p className="text-sm font-semibold text-white">
          {creator.position}{getPositionSuffix(creator.position)}
        </p>
      );
    } else if (typeof creator === 'number') {
      return (
        <p className="text-sm font-semibold text-white">
          {creator}{getPositionSuffix(creator)}
        </p>
      );
    }
    return null;
  }, [getPositionSuffix]);

  const getRowColor = (position, promotions, relegations, totalTeams) => {
    if (position <= promotions) return 'bg-green-700';
    if (position > totalTeams - relegations) return 'bg-red-700';
    return '';
  };

  const fetchMatchesForDivision = useCallback(async (dateString, type) => {
    if (leagueDetails && leagueDetails.divisions.length > 0) {
      setMatchesLoading(true);
      try {
        const divisionId = leagueDetails.divisions[currentDivisionIndex].id;
        console.log('Fetching matches with:', { dateString, type, divisionId });
        const newMatches = await fetchMatches(leagueId, divisionId, dateString, type);
        setMatches(newMatches);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
        setError('Failed to load matches. Please try again.');
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setMatchesLoading(false);
      }
    }
  }, [navigate, leagueId, leagueDetails, currentDivisionIndex]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leagueData, userData, championshipData] = await Promise.all([
          fetchLeagueDetails(leagueId),
          fetchUserDetails(),
          fetchChampionshipDetails(leagueId)
        ]);
        setLeagueDetails(leagueData);
        setUserDetails(userData);
        setChampionshipDetails(championshipData);
        
        if (championshipData && championshipData.championship) {
          setChampionshipName(championshipData.championship);
          setSelectedRound(championshipData.rounds[0]?.name || '');
        }

        const userDivisionIndex = leagueData.divisions.findIndex(
          div => div.table.some(row => row.creator === userData.username)
        );
        setCurrentDivisionIndex(userDivisionIndex !== -1 ? userDivisionIndex : 0);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId]);

  useEffect(() => {
    if (!loading && leagueDetails) {
      fetchMatchesForDivision(selectedDateString, matchType);
    }
  }, [fetchMatchesForDivision, selectedDateString, matchType, currentDivisionIndex, loading, leagueDetails]);

  const handleDateChange = useCallback((event) => {
    if (event && event.target && event.target.value) {
      setSelectedDateString(event.target.value);
    } else {
      console.error('Invalid event in handleDateChange:', event);
    }
  }, []);

  const handleMatchTypeChange = useCallback((type) => {
    setMatchType(type);
  }, []);

  const handleDivisionChange = useCallback((direction) => {
    if (leagueDetails && leagueDetails.divisions) {
      setCurrentDivisionIndex(prevIndex => {
        const newIndex = direction === 'next'
          ? (prevIndex + 1) % leagueDetails.divisions.length
          : (prevIndex - 1 + leagueDetails.divisions.length) % leagueDetails.divisions.length;
        return newIndex;
      });
    }
  }, [leagueDetails]);

  const matchesContent = useMemo(() => {
    if (matchesLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-blue-500" size={48} />
        </div>
      );
    }

    if (matches.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          No matches scheduled for this date.
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {matches.map((match) => (
          <div 
            key={match.id} 
            className="flex flex-col sm:flex-row justify-between items-center text-small bg-gray-700 p-2 sm:p-4 rounded space-y-2 sm:space-y-0"
          >
            <span className="w-full sm:w-24 text-center flex flex-col">
              <span className="text-xs text-gray-400">
                {new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
              </span>
              <span>{match.time}</span>
            </span>
            <span className="w-full sm:w-20 text-center">{renderPosition(match.homeCreator)}</span>
            <div className="flex items-center w-full sm:w-40 justify-center">
              <span className="mr-2">{match.homeCreator.username}</span>
              <ProfilePicture user={match.homeCreator} size="small" />
            </div>
            <span className="mx-4 text-center text-green-500 font-bold">{match.score || '-'}</span>
            <div className="flex items-center w-full sm:w-40 justify-center">
              <ProfilePicture user={match.awayCreator} size="small" />
              <span className="ml-2">{match.awayCreator.username}</span>
            </div>
            <span className="w-full sm:w-20 text-center">{renderPosition(match.awayCreator)}</span>
          </div>
        ))}
      </div>
    );
  }, [matches, matchesLoading, renderPosition]);

  const renderChampionshipContent = () => {
    if (!championshipDetails) {
      return <div className="text-center text-gray-400 py-8">No championship data available.</div>;
    }

    const selectedRoundData = championshipDetails.rounds.find(round => round.name === selectedRound);

    return (
      <div className="bg-gray-900 p-4 rounded-lg mt-4">
        <h2 className="text-xl font-bold mb-4">{championshipName}</h2>
        <p className="mb-4">Status: {championshipDetails.status}</p>
        {championshipDetails.winner && (
          <p className="mb-4 text-green-500 font-bold">Winner: {championshipDetails.winner}</p>
        )}

        {/* Dropdown for round selection */}
        <div className="relative mb-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-gray-800 p-2 rounded flex justify-between items-center"
          >
            <span>{selectedRound || 'Select a round'}</span>
            <ChevronDown size={20} />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 w-full bg-gray-800 mt-1 rounded shadow-lg">
              {championshipDetails.rounds.map((round) => (
                <div
                  key={round.name}
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSelectedRound(round.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  {round.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Display matches for the selected round */}
        {selectedRoundData && (
          <div>
            <h3 className="text-lg font-semibold mb-2">{selectedRoundData.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedRoundData.matches.map((match, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <ProfilePicture user={match.home_creator} size="small" />
                      <span className="ml-2">{match.home_creator.username}</span>
                    </div>
                    <span className="font-bold">VS</span>
                    <div className="flex items-center">
                      {match.away_creator ? (
                        <>
                          <span className="mr-2">{match.away_creator.username}</span>
                          <ProfilePicture user={match.away_creator} size="small" />
                        </>
                      ) : (
                        <span className="text-gray-500">TBD</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{new Date(match.scheduled_time).toLocaleString()}</p>
                  {match.home_score !== null && match.away_score !== null && (
                    <p className="mt-2 text-center font-bold">
                      {match.home_score} - {match.away_score}
                    </p>
                  )}
                  {match.winner && (
                    <p className="mt-2 text-center text-green-500">Winner: {match.winner}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="bg-gray-900 p-4 rounded-lg mt-4">
            <h2 className="text-xl font-bold mb-4">League Overview</h2>
            <p>Total Teams: {leagueDetails.divisions.reduce((acc, div) => acc + div.table.length, 0)}</p>
            <p>Number of Divisions: {leagueDetails.divisions.length}</p>
            <p>Season Duration: {new Date(leagueDetails.startDate).toLocaleDateString()} - {new Date(leagueDetails.endDate).toLocaleDateString()}</p>
          </div>
        );
      case 'matches':
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => handleDivisionChange('prev')} className="bg-gray-900 px-3 py-2 rounded">
                <ArrowLeft size={16} />
              </button>
              <h2 className="text-xl text-gray-500 font-bold">
                {leagueDetails?.divisions[currentDivisionIndex]?.name}
              </h2>
              <button onClick={() => handleDivisionChange('next')} className="bg-gray-900 px-3 py-2 rounded">
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="lg:w-1/3 w-full bg-gray-900 p-4 mb-5 rounded-lg flex text center mx-auto items-center">
              <Trophy className="text-yellow-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-white">Defending Champion</p>
                <p className="text-xl font-bold">{leagueDetails.defendingChampions}</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
              <div className="lg:w-2/3 w-full">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
                    <h2 className="text-xl font-bold">MATCHES & RESULTS</h2>
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <input 
                        type="date" 
                        value={selectedDateString}
                        onChange={handleDateChange}
                        className="bg-gray-700 rounded p-2"
                      />
                      <button 
                        className={`bg-gray-700 px-2 py-1 rounded ${matchType === 'latest' ? 'text-blue-500' : ''}`}
                        onClick={() => handleMatchTypeChange('latest')}
                      >
                        Latest Results
                      </button>
                      <button 
                        className={`bg-gray-700 px-2 py-1 rounded ${matchType === 'next' ? 'text-blue-500' : ''}`}
                        onClick={() => handleMatchTypeChange('next')}
                      >
                        Next Matches
                      </button>
                    </div>
                  </div>
                  {matchesContent}
                </div>
              </div>
              <div className="lg:w-1/3 w-full">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">League Table</h2>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-gray-800">
                        <tr className="text-gray-400">
                          <th className="text-left">Pos</th>
                          <th className="text-left">Team</th>
                          <th className="text-right">P</th>
                          <th className="text-right">GD</th>
                          <th className="text-right">PTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leagueDetails?.divisions[currentDivisionIndex]?.table.map((row, index) => (
                          <tr key={index} className={`border-b border-gray-700 ${getRowColor(row.position, leagueDetails.divisions[currentDivisionIndex].promotions, leagueDetails.divisions[currentDivisionIndex].relegations, leagueDetails.divisions[currentDivisionIndex].table.length)}`}>
                            <td>{renderPosition(row.position)}</td>
                            <td className="flex items-center capitalize">{row.creator}</td>
                            <td className="text-right">{row.played}</td>
                            <td className="text-right">{row.goalDifference}</td>
                            <td className="text-right">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case championshipName:
        return renderChampionshipContent();
      case 'prizes':
        return (
          <div className="bg-gray-900 p-4 rounded-lg mt-4">
            <h2 className="text-xl font-bold mb-4">Prizes</h2>
            <ul className="list-disc list-inside">
              <li>1st Place: $10,000 and promotion to higher league</li>
              <li>2nd Place: $5,000</li>
              <li>3rd Place: $2,500</li>
              <li>Most Voted Creator: Special Trophy and $1,000</li>
            </ul>
          </div>
        );
      case 'history':
        return (
          <div className="bg-gray-900 p-4 rounded-lg mt-4">
            <h2 className="text-xl font-bold mb-4">League History</h2>
            <ul className="space-y-2">
              <li>Season 1 Champion: John Doe</li>
              <li>Season 2 Champion: Jane Smith</li>
              <li>Most Titles: John Doe (2 times)</li>
              <li>Longest Winning Streak: Alice Johnson (8 matches)</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
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

  if (!leagueDetails) return <div>No league details available.</div>;

  return (
    <div className="min-h-screen bg-white text-white">
      <Navigation 
        userDetails={userDetails}
        ProfilePicture={ProfilePicture}
      />
      <main className="p-4 max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between bg-gray-900 p-2 items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
            <div className="p-2 rounded">
              <img src={favicon} alt='scropoll_icon' className='w-12 h-12' />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{leagueDetails.name}</h1>
              <p className="text-sm text-gray-400">Defending Champions - {leagueDetails.defendingChampions}</p>
            </div>
          </div>
        </div>
  
        {/* Navigation */}
        <div className="flex flex-wrap justify-between md:justify-start space-x-4 md:space-x-6 mb-6 overflow-auto">
          {['overview', 'matches', championshipName, 'prizes', 'history'].map((tab) => (
            <span 
              key={tab}
              className={`cursor-pointer ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
          ))}
        </div>

        {renderTabContent()}
      </main>
    </div>
  );
};

export default LeagueDetails;