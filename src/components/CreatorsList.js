import React from 'react';
import ProfilePicture from './ProfilePicture';

const CreatorsList = ({ liveDrawData }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Creators left to show</h3>
      <p className="text-3xl font-bold mb-4">
        {liveDrawData?.remaining_draws || 0}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-32 overflow-y-auto">
        {liveDrawData?.unshown_creators?.map((creator) => (
          <div key={creator.id} className="bg-gray-700 p-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <ProfilePicture user={creator} />
              <span className="text-white truncate">{creator.username}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorsList;