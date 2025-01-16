import React, { useState, useEffect } from 'react';
import { fetchQualificationProgress } from '../apiUtils';
import ProfilePicture from './ProfilePicture';

const QualificationProgress = ({ leagueId }) => {
  const [qualificationData, setQualificationData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchQualificationProgress(leagueId);
        setQualificationData(data);
      } catch (error) {
        console.error('Failed to fetch qualification progress:', error);
      }
    };

    fetchData();
  }, [leagueId]);

  if (!qualificationData) return <div>Loading qualification data...</div>;

  return (
    <div className="qualification-progress bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">New Creator Qualification Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qualificationData.rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="round bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-white">Round {round.number}</h3>
            <div className="matches space-y-4">
              {round.matches.map((match, matchIndex) => (
                <div key={matchIndex} className="match bg-gray-700 p-3 rounded-lg text-white">
                  <div className="flex justify-between items-center mb-2">
                    <ProfilePicture user={match.creator1} size="small" />
                    <span>{match.creator1.username}</span>
                    <span className="font-bold">{match.score1 ?? '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <ProfilePicture user={match.creator2} size="small" />
                    <span>{match.creator2.username}</span>
                    <span className="font-bold">{match.score2 ?? '-'}</span>
                  </div>
                  {match.winner && (
                    <div className="winner mt-2 text-center text-green-500">
                      Winner: {match.winner.username}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {qualificationData.qualifiedCreators && (
        <div className="qualified-creators mt-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Qualified Creators</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {qualificationData.qualifiedCreators.map((creator) => (
              <div key={creator.id} className="creator bg-gray-800 p-3 rounded-lg flex items-center">
                <ProfilePicture user={creator} size="small" />
                <span className="ml-2 text-white">{creator.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualificationProgress;