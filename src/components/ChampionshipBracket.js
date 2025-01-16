import React, { useState, useEffect } from 'react';
import { fetchChampionshipDetails } from '../apiUtils';
import ProfilePicture from './ProfilePicture';

const ChampionshipBracket = ({ leagueId }) => {
  const [championshipData, setChampionshipData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchChampionshipDetails(leagueId);
        setChampionshipData(data);
      } catch (error) {
        console.error('Failed to fetch championship data:', error);
      }
    };

    fetchData();
  }, [leagueId]);

  if (!championshipData) return <div>Loading championship data...</div>;

  return (
    <div className="championship-bracket bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">Music League Championship</h2>
      <div className="flex flex-wrap justify-around">
        {championshipData.stages.map((stage, stageIndex) => (
          <div key={stage.id} className="stage mb-6 w-full md:w-1/3 lg:w-1/4 xl:w-1/5">
            <h3 className="text-xl font-semibold mb-4 text-center text-white">{stage.name}</h3>
            <div className="matches space-y-4">
              {stage.matches.map((match) => (
                <div key={match.id} className="match bg-gray-800 p-4 rounded-lg text-white">
                  <div className="home-team flex items-center justify-between mb-2">
                    <ProfilePicture user={match.homeCreator} size="small" />
                    <span>{match.homeCreator.username}</span>
                    <span className="font-bold">{match.homeScore}</span>
                  </div>
                  <div className="away-team flex items-center justify-between">
                    <ProfilePicture user={match.awayCreator} size="small" />
                    <span>{match.awayCreator.username}</span>
                    <span className="font-bold">{match.awayScore}</span>
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
      {championshipData.winner && (
        <div className="winner mt-8 text-center">
          <h3 className="text-2xl font-bold text-green-500">Championship Winner</h3>
          <div className="flex items-center justify-center mt-4">
            <ProfilePicture user={championshipData.winner} size="large" />
            <span className="ml-4 text-xl font-bold text-white">{championshipData.winner.username}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChampionshipBracket;