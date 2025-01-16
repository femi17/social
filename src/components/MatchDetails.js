import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, } from 'react-router-dom';
import { fetchMatchDetails, fetchUserDetails, likeMatch, addComment } from '../apiUtils';
import ProfilePicture from './ProfilePicture';
import Navigation from './Navigation';
import { Heart, MessageCircle, Lock, ArrowLeft } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';
import CommentModal from './CommentModal';

const MatchDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const { matchId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [userDetailsData, matchDetailsData] = await Promise.all([
          fetchUserDetails(),
          fetchMatchDetails(matchId)
        ]);
        setUserDetails(userDetailsData);
        setMatchDetails(matchDetailsData);
      } catch (err) {
        setError('Failed to fetch match details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [matchId]);

  const handleLike = async (contentId) => {
    try {
      await likeMatch(contentId);
      const updatedMatchDetails = await fetchMatchDetails(matchId);
      setMatchDetails(updatedMatchDetails);
    } catch (error) {
      setError('Failed to like. Please try again.');
    }
  };

  const handleComment = async (contentId, comment) => {
    try {
      await addComment(contentId, comment);
      const updatedMatchDetails = await fetchMatchDetails(matchId);
      setMatchDetails(updatedMatchDetails);
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleOpenComments = () => {
    setIsCommentModalOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentModalOpen(false);
  };

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

  if (!matchDetails) return <div>No match details found</div>;

  return (
    <div className="min-h-screen bg-white-900 text-white">
      <Navigation 
        userDetails={userDetails}
        ProfilePicture={ProfilePicture}
      />
  
      <main className="p-4 max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/fixtures')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </button>
        <div className="bg-gray-900 lg:w-[616px] mx-auto p-6 mt-5 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">{matchDetails?.league ? matchDetails.league : matchDetails?.name || ""} - {matchDetails?.division ? matchDetails.division : matchDetails?.round || ""}</h2>
          <p className="text-gray-400 mb-4">
            {new Date(matchDetails.scheduled_time).toLocaleString()}
          </p>
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <ProfilePicture user={matchDetails.home_creator} size="large" />
              <p className="mt-2">{matchDetails.home_creator.username}</p>
            </div>
            <div className="text-4xl font-bold">
              {matchDetails.home_score} - {matchDetails.away_score}
            </div>
            <div className="text-center">
              <ProfilePicture user={matchDetails.away_creator} size="large" />
              <p className="mt-2">{matchDetails.away_creator.username}</p>
            </div>
          </div>
  
          {matchDetails.content && (
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                {matchDetails.content.uploads1 && (
                  <div>
                    <div className="aspect-[9/16] lg:aspect-[4/6] md:aspect-[4/6]">
                      <CustomVideoPlayer url={matchDetails.content.uploads1} />
                    </div>
                    <div className="mt-2 flex items-center">
                      <Lock size={18} className='text-white mr-2' />
                      <span>{matchDetails.content.vote1_count} votes</span>
                    </div>
                  </div>
                )}
                {matchDetails.content.uploads2 && (
                  <div>
                    <div className="aspect-[9/16] lg:aspect-[4/6] md:aspect-[4/6]">
                      <CustomVideoPlayer url={matchDetails.content.uploads2} />
                    </div>
                    <div className="mt-2 flex items-center">
                      <Lock size={18} className='text-white mr-2' />
                      <span>{matchDetails.content.vote2_count} votes</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center">
                <button 
                  onClick={() => handleLike(matchDetails.content.id)}
                  className={`mr-2 ${matchDetails.content.user_vote?.likes ? 'text-green-500' : 'text-gray-400'}`}
                >
                  <Heart size={20} />
                </button>
                <span>{matchDetails.content.like_count} likes</span>
                <button onClick={handleOpenComments} className="ml-4 flex items-center">
                  <MessageCircle size={20} className="mr-2 text-gray-400" />
                  <span>{matchDetails.content.comment_count} comments</span>
                </button>
              </div>
  
              {matchDetails && matchDetails.content && (
                <div className="mt-4">
                  <div className="mb-2">
                    {matchDetails.content.comments.length > 0 && (
                      <>
                        <p className="font-semibold">{matchDetails.content.comments[0].username}</p>
                        <p>{matchDetails.content.comments[0].comment}</p>
                        <p className="text-xs text-gray-400">{new Date(matchDetails.content.comments[0].date).toLocaleString()}</p>
                      </>
                    )}
                    {matchDetails.content.comment_count > 1 && (
                      <p 
                        className="message text-xs mt-3 text-gray-500 cursor-pointer" 
                        onClick={handleOpenComments}
                      >
                        View all {matchDetails.content.comment_count} comments
                      </p>
                    )}
                  </div>
                  <CommentModal
                    isOpen={isCommentModalOpen}
                    onClose={handleCloseComments}
                    comments={matchDetails.content.comments}
                    contentId={matchDetails.content.id}
                    handleComment={handleComment}
                    userDetails={userDetails}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchDetails;