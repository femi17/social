import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ThumbsUp, Lock } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';
import ProfilePicture from './ProfilePicture';

const FeedContent = ({ content, handleVote }) => {
    const isVotingDisabled = !content.is_voting_open || content.user_voted;
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const { ref, inView } = useInView({
      threshold: 0.1,
      triggerOnce: true,
    });

    useEffect(() => {
      if (inView) {
        setIsVideoLoaded(true);
      }
    }, [inView]);
  
    const renderVoteButton = (voteType, voteCount) => {
      const isWinning = voteType === 'vote1' 
        ? content.vote1_count > content.vote2_count 
        : content.vote2_count > content.vote1_count;
  
      const userVotedThis = content.user_voted === voteType;
  
      return (
        <div className={`bg-gray-900 text-white py-2 px-4 ${voteType === 'vote1' ? 'rounded-l-full' : 'rounded-r-full'} flex items-center`}>
          {voteType === 'vote2' && <span className="vote-count mr-2">{voteCount}</span>}
          <button
            onClick={() => handleVote(content.id, voteType)}
            disabled={isVotingDisabled}
            className={`flex items-center ${isVotingDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            title={
              !content.is_voting_open 
                ? "Voting is closed for this match" 
                : content.user_voted 
                  ? "You have already voted" 
                  : `Vote for ${voteType === 'vote1' ? content.creator1.username : content.creator2.username}`
            }
          >
            {isVotingDisabled ? (
              <Lock size={18} className={userVotedThis ? 'text-green-500' : 'text-white'} />
            ) : (
              <ThumbsUp size={18} className={isWinning ? 'text-white-500' : 'text-white'} />
            )}
          </button>
          {voteType === 'vote1' && <span className="vote-count ml-2">{voteCount}</span>}
        </div>
      );
    };

    return (
      <div ref={ref} className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
    
        <div className="flex relative">
          {/* Left Video Section */}
          <div className="w-1/2 relative">
            {/* Apply responsive aspect ratio - 9:16 on mobile, 4:6 on desktop */}
            <div className="aspect-[9/16] lg:aspect-[4/6] md:aspect-[4/6]">
              {isVideoLoaded ? (
                <CustomVideoPlayer url={content.uploads1} />
              ) : (
                <img src={content.thumbnail1} alt="Video thumbnail" className="w-full h-full object-cover" />
              )}
            </div>
    
            {/* Creator Profile (top-left corner) */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              <span className="flex items-center">
                <ProfilePicture user={content.creator1} size="small" />
                <span className="ml-2 capitalize">{content.creator1.username}</span>
              </span>
            </div>
    
            {/* Vote Button (bottom-left corner) */}
            <div className="absolute bottom-4 left-4 z-10">
              {renderVoteButton('vote1', content.vote1_count)}
            </div>
          </div>
    
          {/* VS Icon (Center) */}
          <div className="content_vs absolute top-1/2 left-1/2 w-[30px] h-[30px] bg-white shadow-md rounded-full z-20 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="text-green-500 font-medium text-sm">VS</span>
          </div>
    
          {/* Right Video Section */}
          <div className="w-1/2 relative">
            {/* Apply responsive aspect ratio - 9:16 on mobile, 4:6 on desktop */}
            <div className="aspect-[9/16] lg:aspect-[4/6] md:aspect-[4/6]">
              {isVideoLoaded ? (
                <CustomVideoPlayer url={content.uploads2} />
              ) : (
                <img src={content.thumbnail2} alt="Video thumbnail" className="w-full h-full object-cover" />
              )}
            </div>
    
            {/* Creator Profile (top-left corner) */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              <span className="flex items-center">
                <ProfilePicture user={content.creator2} size="small" />
                <span className="ml-2 capitalize">{content.creator2.username}</span>
              </span>
            </div>
    
            {/* Vote Button (bottom-right corner) */}
            <div className="absolute bottom-4 right-4 z-10">
              {renderVoteButton('vote2', content.vote2_count)}
            </div>
          </div>
        </div>
      </div>
    );
    
};

export default FeedContent;