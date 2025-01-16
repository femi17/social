import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchFixtures, fetchUserDetails } from '../apiUtils';
import { ArrowLeft } from 'lucide-react';
import ProfilePicture from './ProfilePicture';
import Navigation from './Navigation';

const Fixtures = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSeason, setCurrentSeason] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userDetailsData = await fetchUserDetails();
        setUserDetails(userDetailsData);

        const fixturesData = await fetchFixtures();
        setFixtures(fixturesData.fixtures);
        setCurrentSeason(fixturesData.current_season);
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

  const filteredFixtures = fixtures.filter(fixture => {
    if (filter === 'all') return true;
    if (filter === 'home') return fixture.venue === 'Home';
    if (filter === 'away') return fixture.venue === 'Away';
    return true;
  });

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
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
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/creator-dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold">Fixtures</h1>
          <div className="flex items-center">
            <select
              value={currentSeason}
              onChange={(e) => setCurrentSeason(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded mr-4"
            >
              <option value={currentSeason}>Season {currentSeason}</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Matches</h2>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded ${filter === 'home' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => handleFilterChange('home')}
              >
                Home
              </button>
              <button
                className={`px-3 py-1 rounded ${filter === 'away' ? 'bg-blue-600' : 'bg-gray-700'}`}
                onClick={() => handleFilterChange('away')}
              >
                Away
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Opposition</th>
                  <th className="text-center py-2">Venue</th>
                  <th className="text-center py-2">Result</th>
                  <th className="text-left py-2">Competition</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFixtures.map((fixture, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">{fixture.date}</td>
                    <td className="py-2">{fixture.time}</td>
                    <td className="py-2 flex items-center">
                      {fixture.opposition && (
                        <>
                          <ProfilePicture user={fixture.opposition} size="small" />
                          <span className="ml-2 capitalize">{fixture.opposition.username}</span>
                        </>
                      )}
                    </td>
                    <td className="py-2 text-center">{fixture.venue}</td>
                    <td className="py-2 text-center">{fixture.result || '-'}</td>
                    <td className="py-2">
                    {fixture?.division ? fixture.division : fixture?.name || ""}
                    <span className="text-xs ml-2 text-gray-400">{fixture.round}</span>
                    </td>
                    <td className="py-2">
                      <Link
                        to={`/match/${fixture.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fixtures;