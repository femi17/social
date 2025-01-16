import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

const CollapsibleDrawResults = ({ drawResults, divisions }) => {
  const [openDivisions, setOpenDivisions] = useState({});
  const [groupedResults, setGroupedResults] = useState({});

  useEffect(() => {
    const grouped = drawResults.reduce((acc, result) => {
      if (result && result.division) {
        if (!acc[result.division.id]) {
          acc[result.division.id] = [];
        }
        acc[result.division.id].push(result);
      }
      return acc;
    }, {});
    setGroupedResults(grouped);
  }, [drawResults]);

  const toggleDivision = (divisionId) => {
    setOpenDivisions(prev => ({
      ...prev,
      [divisionId]: !prev[divisionId]
    }));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-xl font-bold mb-2 text-white">Draw Results</h3>
      {divisions.map((division) => {
        const divisionResults = groupedResults[division.id] || [];
        return (
          <div key={division.id} className="mb-2">
            <button
              onClick={() => toggleDivision(division.id)}
              className="flex justify-between items-center w-full p-2 bg-gray-700 rounded"
            >
              <span className="font-bold text-white">{division.name}</span>
              <span className="text-sm text-gray-400">
                {divisionResults.length} / {division.capacity}
              </span>
              {openDivisions[division.id] ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
            </button>
            {openDivisions[division.id] && (
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {divisionResults.map((result, index) => (
                  <div key={index} className="flex items-center bg-gray-600 p-2 rounded">
                    <ProfilePicture user={result.creator} size="small" />
                    <span className="ml-2 text-white">{result.creator.username}</span>
                  </div>
                ))}
                {divisionResults.length === 0 && (
                  <p className="text-gray-400">No creators assigned yet.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CollapsibleDrawResults;