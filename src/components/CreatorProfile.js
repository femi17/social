import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, TrendingUp, Edit, Trash2, Lock, Camera } from 'lucide-react';
import { fetchUserDetails, fetchCreatorProfile, updateProfilePicture, changePassword, deleteContent } from '../apiUtils';
import Navigation from './Navigation';
import ProfilePicture from './ProfilePicture';
import CreatorContent from './CreatorContent';

const CreatorProfile = () => {
  const { creatorId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDetailsData, profileData] = await Promise.all([
          fetchUserDetails(),
          fetchCreatorProfile(creatorId)
        ]);
        setUserDetails(userDetailsData);
        setCreatorProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [creatorId]);

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const updatedProfile = await updateProfilePicture(creatorId, file);
        setCreatorProfile(updatedProfile);
      } catch (error) {
        setError('Failed to update profile picture. Please try again.');
      }
    }
  };

  const handlePasswordChange = async () => {
    try {
      await changePassword(creatorId, newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      alert('Password changed successfully!');
    } catch (error) {
      setError('Failed to change password. Please try again.');
    }
  };

  const handleContentDelete = async (contentId) => {
    try {
      await deleteContent(contentId);
      const updatedProfile = await fetchCreatorProfile(creatorId);
      setCreatorProfile(updatedProfile);
    } catch (error) {
      setError('Failed to delete content. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!creatorProfile) return <div>No profile data available.</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation 
        userDetails={userDetails}
        ProfilePicture={ProfilePicture}
      />

      <main className="container mx-auto py-8 px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2" /> Back
        </button>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="relative">
              <ProfilePicture user={creatorProfile} size="large" />
              <label htmlFor="profile-picture-input" className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer">
                <Camera size={16} color="white" />
              </label>
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold">{creatorProfile.username}</h1>
              <p className="text-gray-600">{creatorProfile.bio}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg flex items-center">
              <Trophy className="text-yellow-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">League Position</p>
                <p className="text-xl font-bold">{creatorProfile.leaguePosition}</p>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg flex items-center">
              <Star className="text-yellow-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-xl font-bold">{creatorProfile.totalPoints}</p>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg flex items-center">
              <TrendingUp className="text-green-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-xl font-bold">{creatorProfile.winRate}%</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Lock size={16} className="mr-2" />
            Change Password
          </button>
        </div>

        <CreatorContent 
          creatorId={creatorId} 
          content={creatorProfile.content}
          onDeleteContent={handleContentDelete}
        />
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="border p-2 mb-4 w-full"
            />
            <div className="flex justify-end">
              <button
                onClick={handlePasswordChange}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Change
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProfile;