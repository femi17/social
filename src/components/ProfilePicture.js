import React from 'react';

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-12 h-12',
  large: 'w-20 h-20'
};

const getInitials = (username) => {
  if (!username) return '?';

  const nameParts = username.split(' '); // Split by space

  if (nameParts.length > 1) {
    // If the username contains at least two parts, return the first letter of the first two parts
    return nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
  } else {
    // Otherwise, return the first two characters of the single part
    return username.substring(0, 2).toUpperCase();
  }
};

const getRandomColor = (username) => {
  if (!username) return 'bg-gray-500'; // Default color if no username is provided
  
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const getAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${url}`;
};

const ProfilePicture = ({ user, size = 'medium' }) => {
  const sizeClass = sizeClasses[size] || sizeClasses.medium; // Default to 'medium' size if not provided

  if (user.profile_picture) {
    const absoluteUrl = getAbsoluteUrl(user.profile_picture);
    return <img src={absoluteUrl} alt={user.username} className={`${sizeClass} rounded-full object-cover`} />;
  } else {
    const bgColor = getRandomColor(user.username);
    return (
      <div className={`${sizeClass} rounded-full ${bgColor} flex items-center justify-center text-white font-bold`}>
        {getInitials(user.username)}
      </div>
    );
  }
};

export default ProfilePicture;




