import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Heart, MessageCircle, PieChart, ArrowLeft, ArrowRight, Sun, Cloud, Snowflake, Leaf, Loader } from 'lucide-react';
import { fetchFeed, fetchUserDetails, voteForMatch, likeMatch, addComment, fetchDivisions, fetchDivisionTable } from '../apiUtils';
import '../assets/css/Feed.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProfilePicture from './ProfilePicture';
import Navigation from './Navigation';
import favicon from '../assets/favicon.png';
import FeedContent from './FeedContent';
import CommentModal from './CommentModal';

const Feed = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [divisions, setDivisions] = useState([]);
  const [currentDivisionIndex, setCurrentDivisionIndex] = useState(0);
  const [divisionTable, setDivisionTable] = useState([]);
  const [error, setError] = useState(null);
  const [feedType, setFeedType] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCommentContentId, setActiveCommentContentId] = useState(null);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  const getSeasonIcon = (season) => {
    switch(season) {
      case 'SPRING':
        return <Cloud className="text-blue-400" />;
      case 'SUMMER':
        return <Sun className="text-yellow-400" />;
      case 'FALL':
        return <Leaf className="text-orange-400" />;
      case 'WINTER':
        return <Snowflake className="text-blue-200" />;
      default:
        return null;
    }
  };

  const fetchDivisionTableData = useCallback(async (divisionId) => {
    try {
      const tableData = await fetchDivisionTable(divisionId);
      setDivisionTable(tableData);
    } catch (error) {
      console.error('Failed to fetch division table:', error);
      setError('Failed to load division table. Please try again.');
    }
  }, []);

  const fetchMoreData = useCallback(async () => {
    if (!hasMore) return;
    try {
      const response = await fetchFeed(feedType, page);
      const newItems = Array.isArray(response.results) ? response.results : [];
      setFeedItems(prevItems => [...prevItems, ...newItems]);
      setPage(prevPage => prevPage + 1);
      setHasMore(!!response.next);
    } catch (error) {
      console.error('Error fetching more feed data:', error);
      setError('Failed to load more items. Please try again.');
    }
  }, [feedType, page, hasMore]);

  const refreshFeed = useCallback(async () => {
    try {
      const response = await fetchFeed(feedType, 1);
      const newItems = Array.isArray(response.results) ? response.results : [];
      
      setFeedItems(prevItems => {
        const updatedItems = newItems.map(newItem => {
          const existingItem = prevItems.find(item => item.id === newItem.id);
          return existingItem ? { ...existingItem, ...newItem } : newItem;
        });
        
        const oldItems = prevItems.filter(item => !newItems.some(newItem => newItem.id === item.id));
        
        return [...updatedItems, ...oldItems];
      });
      
      setHasMore(!!response.next);
    } catch (error) {
      console.error('Error refreshing feed:', error);
    }
  }, [feedType]);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userDetailsData, divisionsData, feedResponse] = await Promise.all([
        fetchUserDetails(),
        fetchDivisions(),
        fetchFeed(feedType, 1)
      ]);
      
      setUserDetails(userDetailsData);
      setDivisions(divisionsData);
      
      if (divisionsData.length > 0) {
        fetchDivisionTableData(divisionsData[0].id);
      }

      const initialFeedItems = Array.isArray(feedResponse.results) ? feedResponse.results : [];
      setFeedItems(initialFeedItems);
      setPage(2);
      setHasMore(!!feedResponse.next);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setError(error.message || 'An error occurred while fetching data');
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, feedType, fetchDivisionTableData]);

  const handleDivisionChange = useCallback((direction) => {
    setCurrentDivisionIndex(prevIndex => {
      const newIndex = direction === 'next'
        ? (prevIndex + 1) % divisions.length
        : (prevIndex - 1 + divisions.length) % divisions.length;
      
      fetchDivisionTableData(divisions[newIndex].id);
      return newIndex;
    });
  }, [divisions, fetchDivisionTableData]);

  const handleVote = useCallback(async (contentId, voteChoice) => {
    try {
      setFeedItems(prevItems => 
        prevItems.map(item => 
          item.id === contentId
            ? {
                ...item,
                [voteChoice === 'vote1' ? 'vote1_count' : 'vote2_count']: item[voteChoice === 'vote1' ? 'vote1_count' : 'vote2_count'] + 1,
                user_voted: voteChoice
              }
            : item
        )
      );

      await voteForMatch(contentId, voteChoice);
    } catch (error) {
      console.error('Failed to vote:', error);
      setFeedItems(prevItems => 
        prevItems.map(item => 
          item.id === contentId
            ? {
                ...item,
                [voteChoice === 'vote1' ? 'vote1_count' : 'vote2_count']: item[voteChoice === 'vote1' ? 'vote1_count' : 'vote2_count'] - 1,
                user_voted: null
              }
            : item
        )
      );
      setError('Failed to vote. Please try again.');
    }
  }, []);

  const handleLike = useCallback(async (contentId) => {
    try {
      setFeedItems(prevItems => 
        prevItems.map(item => 
          item.id === contentId
            ? { ...item, like_count: item.user_liked ? item.like_count - 1 : item.like_count + 1, user_liked: !item.user_liked }
            : item
        )
      );

      await likeMatch(contentId);
    } catch (error) {
      console.error('Failed to like match:', error);
      setFeedItems(prevItems => 
        prevItems.map(item => 
          item.id === contentId
            ? { ...item, like_count: item.user_liked ? item.like_count + 1 : item.like_count - 1, user_liked: !item.user_liked }
            : item
        )
      );
      setError('Failed to like. Please try again.');
    }
  }, []);

  const handleComment = useCallback(async (contentId, comment) => {
    try {
      const newComment = { user: userDetails.username, text: comment, date: new Date().toISOString() };
      setFeedItems(prevItems => 
        prevItems.map(item => 
          item.id === contentId
            ? { 
                ...item, 
                comments: [newComment, ...item.comments],
                comment_count: item.comment_count + 1
              }
            : item
        )
      );

      await addComment(contentId, comment);
    } catch (error) {
      console.error('Failed to add comment:', error);
      setFeedItems(prevItems => 
        prevItems.map(item => 
          item.id === contentId
            ? { 
                ...item, 
                comments: item.comments.slice(1),
                comment_count: item.comment_count - 1
              }
            : item
        )
      );
      setError('Failed to add comment. Please try again.');
    }
  }, [userDetails]);

  const handleOpenComments = useCallback((contentId) => {
    setActiveCommentContentId(contentId);
  }, []);

  const handleCloseComments = useCallback(() => {
    setActiveCommentContentId(null);
  }, []);

  const getPositionSuffix = (position) => {
    if (position % 100 >= 11 && position % 100 <= 13) {
      return 'th';
    }
    switch (position % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const memoizedFeedItems = useMemo(() => feedItems.map((content) => (
    <React.Fragment key={content.id}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-md mt-6 pb-4">
        <div className="content__pic flex items-center p-5">
          <img src={favicon} alt='scropoll_icon' className='w-12 h-12' />
          <p className="ml-2 text-sm font-medium text-gray-800">
            {content.league} <br />
            <span className='text-xs text-gray-400'>{content?.division ? content.division : content?.cup || ""}</span>
            <br />
            <span className="text-xs text-gray-500">{content.game_time}</span>
          </p>
        </div>
        <div className="flex items-center">
          {getSeasonIcon(content.season)}
          <span className="ml-2 text-sm font-medium">{content.season}</span>
        </div>
  
        <FeedContent content={content} handleVote={handleVote} />
  
        <div className="content_icons ic flex items-center mx-6 my-3 text-gray-700">
          <Heart 
            onClick={() => handleLike(content.id)}
            className={`mr-3 cursor-pointer ${content.user_liked ? 'text-green-500' : ''}`}
          />
          <span className="mr-3">{content.like_count}</span>
          <MessageCircle 
            className={`mr-3 cursor-pointer ${content.user_comment ? 'text-green-500' : ''}`} 
            onClick={() => handleOpenComments(content.id)} 
          />
          <span className="mr-3">{content.comment_count}</span>
          <PieChart className={`mr-3 ${content.user_voted ? 'text-green-500' : ''}`} />
          <span className="text-green-500">{content.poll_count}</span>
        </div>
  
        <div className="comments mx-6">
          <p className="text-sm text-gray-800">{content.like_count} likes</p>
          {content.show_comment && content.show_comment.length > 0 && (
            <div className="recent-comment">
              <p className="text-sm text-gray-800">
                <strong>{content.show_comment[0].user}</strong> {content.show_comment[0].text}
              </p>
              <p className="text-xs text-gray-400">{new Date(content.show_comment[0].date).toLocaleString()}</p>
            </div>
          )}
          {content.show_comment && content.show_comment.length > 1 && (
            <p 
              className="message text-xs text-gray-500 cursor-pointer" 
              onClick={() => handleOpenComments(content.id)}
            >
              View all {content.comment_count} comments
            </p>
          )}
        </div>
      </div>
  
      <CommentModal
        isOpen={activeCommentContentId === content.id}
        onClose={handleCloseComments}
        comments={content.comments}
        contentId={content.id}
        handleComment={handleComment}
        userDetails={userDetails}
      />
    </React.Fragment>
  )), [feedItems,  handleVote, handleLike, handleOpenComments, handleCloseComments, handleComment, activeCommentContentId, userDetails]);

  const memoizedDivisionTable = useMemo(() => (
    <table className="min-w-full">
      <thead>
        <tr className="text-left">
          <th className="py-2">POS</th>
          <th className="py-2">Creator</th>
          <th className="py-2">P</th>
          <th className="py-2">W</th>
          <th className="py-2">D</th>
          <th className="py-2">L</th>
          <th className="py-2">PTS</th>
        </tr>
      </thead>
      <tbody>
        {divisionTable.map((row, index) => (
          <tr key={index} className="border-b text-center">
            <td className="py-2 text-left">{row.position}{getPositionSuffix(row.position)}</td>
            <td className="py-2 flex items-center">
              <ProfilePicture user={row.creator} size="small" />
              <span className="ml-2">{row.creator.username}</span>
            </td>
            <td className="py-2">{row.played}</td>
            <td className="py-2">{row.won}</td>
            <td className="py-2">{row.drawn}</td>
            <td className="py-2">{row.lost}</td>
            <td className="py-2">{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ), [divisionTable]);

  useEffect(() => {
    fetchInitialData();
    const refreshInterval = setInterval(refreshFeed, 5000); // Refresh every minute
    return () => clearInterval(refreshInterval);
  }, [fetchInitialData, refreshFeed]);

  useEffect(() => {
    setFeedItems([]);
    setPage(1);
    setHasMore(true);
    fetchInitialData();
  }, [feedType, fetchInitialData]);

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation 
        userDetails={userDetails}
        ProfilePicture={ProfilePicture}
      />
  
      <main className="mt-20 flex flex-col lg:flex-row justify-between px-4">
        <div className="hidden lg:block w-1/6"></div>
        
        <div className="w-full lg:w-[616px] mb-8">
          {userDetails.is_fan && (
            <div className="mb-4 flex justify-center lg:justify-start">
              <button 
                className={`mr-2 px-4 py-2 rounded ${feedType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setFeedType('all')}
              >
                All
              </button>
                <button 
                  className={`mr-2 px-4 py-2 rounded ${feedType === 'following' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setFeedType('following')}
                >
                  Following
                </button>

              <button 
                className={`px-4 py-2 rounded lg:hidden ${feedType === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setFeedType('table')}
              >
                Table
              </button>
            </div>
          )}
  
          {feedType === 'all' && (
            feedItems.length > 0 ? (
              <InfiniteScroll
                dataLength={feedItems.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<div className="flex justify-center items-center h-64">
                  <Loader className="animate-spin text-blue-500" size={48} />
                </div>}
              >
                {memoizedFeedItems}
              </InfiniteScroll>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                No feed items available at this time, it is either the league hasn't started or the season has ended.
              </div>
            )
          )}
  
          {feedType === 'following' && (
            feedItems.filter(item => item.isFollowing).length > 0 ? (
              <InfiniteScroll
                dataLength={feedItems.filter(item => item.isFollowing).length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<div className="flex justify-center items-center h-64">
                  <Loader className="animate-spin text-blue-500" size={48} />
                </div>}
              >
                {feedItems.filter(item => item.isFollowing).map((content) => (
                  <React.Fragment key={content.id}>
                    {/* Your feed content rendering logic */}
                  </React.Fragment>
                ))}
              </InfiniteScroll>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                No feed items from people you follow.
              </div>
            )
          )}

  
          {feedType === 'table' && (
            <div className="lg:hidden">
              <div className="bg-gray-900 text-white p-4 rounded-lg shadow mt-4">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => handleDivisionChange('prev')} className="p-2"><ArrowLeft /></button>
                  <h2 className="text-xl font-bold">{divisions[currentDivisionIndex]?.name}</h2>
                  <button onClick={() => handleDivisionChange('next')} className="p-2"><ArrowRight /></button>
                </div>
                <div className='division-table overflow-x-auto '>
                  {memoizedDivisionTable}
                </div>
              </div>
            </div>
          )}
        </div>
  
        <div className="hidden lg:block w-96 sticky top-20 self-start">
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => handleDivisionChange('prev')} className="p-2"><ArrowLeft /></button>
              <h2 className="text-xl font-bold">{divisions[currentDivisionIndex]?.name}</h2>
              <button onClick={() => handleDivisionChange('next')} className="p-2"><ArrowRight /></button>
            </div>
            <div className='division-table scrollbar-thin'>
              {memoizedDivisionTable}
            </div>
          </div>
        </div>
        <div className="hidden lg:block w-1/8"></div>
      </main>
    </div>
  );
};

export default Feed;