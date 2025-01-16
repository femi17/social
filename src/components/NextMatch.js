import React from 'react';
import { MapPin, Clock, Calendar, Trophy } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

const NextMatch = ({ nextMatch, leagueInfo, navigate }) => {

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
        const now = new Date();
        const match = new Date(matchDate);

        // Reset time part to compare only the date
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const matchDateOnly = new Date(match.getFullYear(), match.getMonth(), match.getDate());

        const diffTime = Math.abs(matchDateOnly - nowDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // If the match is today, return "Today"
        if (nowDate.getTime() === matchDateOnly.getTime()) {
            return "Today";
        }

        return diffDays;
    };

    const daysRemaining = getDaysRemaining(nextMatch.scheduled_time);

    const getPositionSuffix = (position) => {
        if (position % 100 >= 11 && position % 100 <= 13) {
          return 'th';
        }
        switch (position % 10) {
          case 1:
            return 'st';
          case 2:
            return 'nd';
          case 3:
            return 'rd';
          default:
            return 'th';
        }
      };

    const renderPosition = (creator) => {
        if (creator.position) {
            return (
                <p className="text-sm font-semibold text-white">
                    {creator.position}{getPositionSuffix(creator.position)}
                </p>
            );
        }
        return null;
    };

    return (
        <div className="lg:w-5/12 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-center text-cyan-400 font-semibold mb-2">
            <Calendar className="mr-2 text-center" size={20} /> NEXT MATCH
          </h2>
          <p className="text-center text-gray-400 mb-2">
            {formatDate(nextMatch.scheduled_time)} ({daysRemaining === "Today" ? daysRemaining : `${daysRemaining} days`})
          </p>
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
            
            <div className="text-center">
              <ProfilePicture user={nextMatch.home_creator} size="large" />
              {nextMatch.league && renderPosition(nextMatch.home_creator)}
            </div>
      
            <div className="text-center mx-4">
              <p className="text-lg sm:text-xl font-bold text-gray-400">{nextMatch?.league ? nextMatch.league : nextMatch?.name || ""}</p>
              <p className="text-lg sm:text-xl font-bold text-white capitalize">
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
                    <span className="text-sm text-gray-400">{nextMatch.round_name}</span>
                  </>
                )}
                <Clock className="w-4 h-4 text-gray-400" /> 
                <span className="text-sm text-gray-400">{formatTime(nextMatch.scheduled_time)}</span>
              </div>
            </div>
      
            <div className="text-center">
              <ProfilePicture user={nextMatch.away_creator} size="large" />
              {renderPosition(nextMatch.away_creator)}
            </div>
          </div>
      
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/fixtures')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              See Fixtures
            </button>
          </div>
        </div>
      );
      
    };

export default NextMatch;