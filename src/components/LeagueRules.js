import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Users, Award, Clock, Shield } from 'lucide-react';
import { fetchUserDetails } from '../apiUtils';
import Navigation from './Navigation';
import ProfilePicture from './ProfilePicture';

const LeagueRules = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDetailsData = await fetchUserDetails();
        setUserDetails(userDetailsData);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const rules = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "League Structure",
      content: "The league is divided into multiple divisions. Each division consists of 42 creators. Creators compete within their division throughout the season."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Match Schedule",
      content: "Matches are scheduled every 2 days. Each creator will play against every other creator in their division once per season."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Scoring System",
      content: "Wins are worth 3 points, draws 1 point, and losses 0 points. The creator with the most points at the end of the season wins their division."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Content Rules",
      content: "Creators must upload their content before the match start time. Content should be original, family-friendly, and related to the match theme if specified."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Promotion and Relegation",
      content: "At the end of each season, top performers are promoted to a higher division, while those at the bottom are relegated to a lower division."
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Fair Play",
      content: "Creators are expected to compete fairly. Any form of cheating, including artificial inflation of votes, will result in disqualification."
    }
  ];

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
          <h1 className="text-3xl font-bold">League Rules</h1>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Rules and Regulations</h2>
          <div className="space-y-6">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-md bg-indigo-500 text-white">
                  {rule.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">{rule.title}</h3>
                  <p className="mt-1 text-gray-400">{rule.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Additional Information</h2>
          <p className="text-gray-400">
            For any queries or clarifications about the league rules, please contact the league administration. 
            Remember, these rules are in place to ensure fair play and an enjoyable experience for all participants.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LeagueRules;