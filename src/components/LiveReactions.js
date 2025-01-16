import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { addLiveReaction, getLiveReactions } from '../apiUtils';
import ProfilePicture from './ProfilePicture';

const LiveReactions = ({ leagueId }) => {
  const [reactions, setReactions] = useState([]);
  const [reactionInput, setReactionInput] = useState('');
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const reactionsEndRef = useRef(null);

  const fetchReactions = useCallback(async () => {
    if (!leagueId) {
      setError("League ID is not available.");
      return;
    }
    try {
      const fetchedReactions = await getLiveReactions(leagueId);
      setReactions(fetchedReactions);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch reactions:', error);
      setError("Failed to load reactions. Please try again.");
    }
  }, [leagueId]);

  useEffect(() => {
    if (leagueId) {
      fetchReactions();
      const intervalId = setInterval(fetchReactions, 5000);
      return () => clearInterval(intervalId);
    }
  }, [fetchReactions, leagueId]);

  const handleReactionSubmit = async (e) => {
    e.preventDefault();
    if (!leagueId || !reactionInput.trim()) return;
    try {
      await addLiveReaction(leagueId, reactionInput.trim());
      setReactionInput('');
      inputRef.current?.focus();
      fetchReactions();
    } catch (error) {
      console.error('Failed to add reaction:', error);
      setError("Failed to submit reaction. Please try again.");
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-lg flex flex-col h-full">
      <h3 className="text-xl font-bold mb-2 text-white">LIVE REACTIONS</h3>
      <div className="flex-grow overflow-y-auto mb-4 custom-scrollbar" style={{ maxHeight: '300px' }}>
        {reactions.map((reaction, index) => (
          <div 
            key={reaction.id} 
            className={`flex items-start space-x-2 p-3 ${
              index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-600'
            } rounded-lg mb-2`}
          >
            <ProfilePicture user={reaction} size="small" />
            <div className="flex-grow">
              <p className="font-semibold text-justify text-white">{reaction.user}</p>
              <p className="text-sm text-justify text-gray-300">{reaction.message}</p>
            </div>
          </div>
        ))}
        <div ref={reactionsEndRef} />
      </div>
      <form onSubmit={handleReactionSubmit} className="flex mt-auto">
        <input
          ref={inputRef}
          type="text"
          value={reactionInput}
          onChange={(e) => setReactionInput(e.target.value)}
          placeholder="Type your reaction..."
          className="flex-grow px-4 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded-r-md hover:bg-indigo-600 transition-colors duration-300">
          <MessageSquare size={20} />
        </button>
      </form>
    </div>
  );
};

export default LiveReactions;