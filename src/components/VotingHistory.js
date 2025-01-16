import React from 'react';
import { ThumbsUp, MessageSquare, Heart } from 'lucide-react';

const VotingHistory = ({ votingHistory }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Interaction History</h2>
      <div className="overflow-y-auto scrollbar-thin pr-4" style={{ maxHeight: '300px' }}>
        {votingHistory.length > 0 ? (
          votingHistory.map((interaction, index) => (
            <div key={index} className="mb-4 pb-4 border-b border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-400">
                  {new Date(interaction.date).toLocaleString()}
                </p>
                <div className="flex space-x-2">
                  {interaction.vote && <ThumbsUp className="text-blue-500" size={16} />}
                  {interaction.like && <Heart className="text-green-500" size={16} />}
                  {interaction.comment && <MessageSquare className="text-yellow-500" size={16} />}
                </div>
              </div>
              <p className="text-white font-semibold">{interaction.creator}</p>
              <p className="text-gray-300 text-sm">{interaction.content}</p>
              {interaction.comment && (
                <p className="text-gray-400 text-sm mt-1 italic">"{interaction.comment}"</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-white">No interaction history available.</p>
        )}
      </div>
    </div>
  );
};

export default VotingHistory;