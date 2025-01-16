import React, { useState, useEffect, useCallback } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import DrawDisplay from './DrawDisplay';
import { fetchUserDetails, fetchLiveDrawData, startLeagueDraw, performLeagueDraw, getDrawResults, assignDivision } from '../apiUtils';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfilePicture from './ProfilePicture';
import CollapsibleDrawResults from './CollapsibleDrawResults';
import Navigation from './Navigation';
import LiveReactions from './LiveReactions';

const LiveDraw = () => {
  const [viewMode, setViewMode] = useState('live');
  const [userDetails, setUserDetails] = useState(null);
  const [liveDrawData, setLiveDrawData] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [drawStatus, setDrawStatus] = useState('PENDING');
  const [drawResults, setDrawResults] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [drawnCreator, setDrawnCreator] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [assignedDivision, setAssignedDivision] = useState(null);
  const [showDrawCard, setShowDrawCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animationState, setAnimationState] = useState('idle');
  const navigate = useNavigate();
  const { leagueId } = useParams();

  const performNextDraw = useCallback(async () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setError(null);
  
    try {
      setAnimationState('drawing');
      const drawResult = await performLeagueDraw(leagueId);
      
      if (drawResult.draw_complete) {
        setDrawStatus('COMPLETED');
        const updatedLiveDrawData = await fetchLiveDrawData(leagueId);
        setLiveDrawData(updatedLiveDrawData);
        setIsDrawing(false);
        setShowDrawCard(false);
        setAnimationState('complete');
        return;
      }
      
      setDrawnCreator(drawResult.creator);
      setAssignedDivision(drawResult.division);
      setCurrentDraw(drawResult.draw);
      
      // Update drawResults immediately after each draw
      setDrawResults(prevResults => [...prevResults, drawResult.draw]);
  
      setLiveDrawData(prevData => ({
        ...prevData,
        users: prevData.users.filter(user => user.id !== drawResult.creator.id)
      }));
  
      setAnimationState('assigning');
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      setAnimationState('complete');
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      setDrawnCreator(null);
      setAssignedDivision(null);
      setIsDrawing(false);
      setAnimationState('idle');
  
      if (!drawResult.draw_complete) {
        performNextDraw();
      } else {
        setDrawStatus('COMPLETED');
        setShowDrawCard(false);
      }
    } catch (error) {
      console.error('Failed to perform draw:', error);
      setError(error.response?.data?.error || "Failed to complete the draw. Please try again.");
      setDrawStatus('ERROR');
      setIsDrawing(false);
      setAnimationState('idle');
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [leagueId, isDrawing]);

  const startDraw = useCallback(async () => {
    if (drawStatus !== 'PENDING') return;
    
    try {
      setError(null);
      const response = await startLeagueDraw(leagueId);
      if (response.message === "Draw started successfully." || response.message === "Draw is already in progress.") {
        setDrawStatus('DRAW_IN_PROGRESS');
        setShowDrawCard(true);
        performNextDraw();
      } else {
        setError(response.error || "An unexpected error occurred.");
      }
    } catch (error) {
      console.error('Failed to start draw:', error);
      setError(error.response?.data?.error || "Failed to start the draw. Please try again.");
    }
  }, [leagueId, drawStatus, performNextDraw]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDetailsData, liveDrawData] = await Promise.all([
          fetchUserDetails(),
          fetchLiveDrawData(leagueId),
        ]);
        setUserDetails(userDetailsData);
        setLiveDrawData(liveDrawData);
        
        if (liveDrawData.league.status === 'DRAW_IN_PROGRESS') {
          setDrawStatus('DRAW_IN_PROGRESS');
          const results = await getDrawResults(leagueId);
          setDrawResults(results.results);
          if (!results.draw_complete) {
            performNextDraw();
          }
        } else if (liveDrawData.league.status === 'ACTIVE' || liveDrawData.league.status === 'COMPLETED') {
          setDrawStatus('COMPLETED');
          const results = await getDrawResults(leagueId);
          setDrawResults(results.results);
        } else if (liveDrawData.time_to_draw > 0) {
          setCountdown(liveDrawData.time_to_draw);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load initial data. Please refresh the page.');
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();

    // Set up polling for draw results
    const pollInterval = setInterval(async () => {
      if (drawStatus === 'DRAW_IN_PROGRESS' || drawStatus === 'COMPLETED') {
        try {
          const results = await getDrawResults(leagueId);
          setDrawResults(results.results);
          if (results.draw_complete) {
            setDrawStatus('COMPLETED');
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error polling draw results:', error);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [navigate, leagueId, performNextDraw, drawStatus]);

  useEffect(() => {
    let timer;
    if (isInitialized && countdown !== null && countdown > 0 && drawStatus === 'PENDING') {
      timer = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            startDraw();
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [countdown, drawStatus, startDraw, isInitialized]);


  useEffect(() => {
    let timer;
    if (liveDrawData && liveDrawData.time_to_draw > 0) {
      const serverClientTimeDiff = liveDrawData.serverTime - liveDrawData.clientTime;
      const initialCountdown = Math.max(0, liveDrawData.time_to_draw - Math.floor((Date.now() - liveDrawData.clientTime) / 1000));
      setCountdown(initialCountdown);
  
      timer = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - liveDrawData.clientTime) / 1000);
        const newCountdown = Math.max(0, liveDrawData.time_to_draw - elapsedTime);
        setCountdown(newCountdown);
  
        if (newCountdown === 0 && drawStatus === 'PENDING') {
          startDraw();
        }
      }, 1000);
    }
  
    return () => clearInterval(timer);
  }, [liveDrawData, drawStatus, startDraw]);

  const formatTime = (time) => {
    if (typeof time !== 'number' || isNaN(time)) {
      return '--:--:--';
    }
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

  return (
    <div className="min-h-screen bg-white-900 text-white">
      {/* Header */}
      <Navigation 
        userDetails={userDetails}
        ProfilePicture={ProfilePicture}
      />

      {/* Main content */}
      <main className="p-4 max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          {/* Back Button on the left */}
          <button
            onClick={() => navigate('/creator-dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>

          {/* Live Draw and Draw Overview buttons on the right */}
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md ${viewMode === 'live' ? 'bg-blue-600' : 'bg-gray-600'}`}
              onClick={() => setViewMode('live')}
            >
              Live Draw
            </button>
            <button
              className={`px-4 py-2 rounded-md ${viewMode === 'overview' ? 'bg-blue-600' : 'bg-gray-600'}`}
              onClick={() => setViewMode('overview')}
            >
              Draw Overview
            </button>
          </div>
        </div>

        {viewMode === 'live' ? (
          <div className="flex flex-col items-center justify-center">
            <div className="bg-gray-800 p-4 rounded-lg text-center w-full max-w-2xl">
              <h1 className="text-3xl font-bold text-white mb-4">
                {liveDrawData ? `${liveDrawData.league.name} - LIVE DRAW` : 'LIVE DRAW'}
              </h1>
              {drawStatus === 'PENDING' && countdown > 0 && (
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-white">Draw starts in:</h2>
                  <p className="text-3xl font-bold text-white">{formatTime(countdown)}</p>
                </div>
              )}
              {drawStatus === 'DRAW_IN_PROGRESS' && (
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-white">Draw in progress...</h2>
                </div>
              )}
              {drawStatus === 'COMPLETED' && (
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-white">Draw completed!</h2>
                </div>
              )}
              
              {/* New DrawDisplay component */}
              {showDrawCard && (
                <DrawDisplay 
                  drawnCreator={drawnCreator}
                  assignedDivision={assignedDivision}
                  animationState={animationState}
                  showCard={showDrawCard}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 p-4 rounded-lg mb-4">
            <h2 className="text-2xl font-bold text-white mb-4">Draw Overview</h2>
            {liveDrawData && drawResults.length > 0 ? (
              <CollapsibleDrawResults drawResults={drawResults} divisions={liveDrawData.divisions} />
            ) : (
              <p className="text-lg text-white">No results available.</p>
            )}
          </div>
        )}

       {drawStatus !== 'COMPLETED' && (
        <div className="grid grid-cols-1 mt-10 md:grid-cols-2 gap-4">
          {/* Divisions and Creators List */}
          <div className="bg-gray-800 p-4 rounded-lg text-center w-full max-w-2xl">
            {liveDrawData && (
              <>
                <h3 className="text-xl font-bold text-white mb-2">Divisions</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {liveDrawData.divisions.map((division) => (
                    <button key={division.id} className="px-3 py-1 bg-gray-700 rounded text-white">
                      {division.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Users for the league */}
            {liveDrawData && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-2">
                  {liveDrawData.users.length} creators left to draw
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {liveDrawData.users.map((user) => (
                    <div key={user.id} className="bg-gray-700 p-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ProfilePicture user={user} />
                        <span className="text-white truncate">{user.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reactions Section */}
          <div className="bg-gray-800 p-4 rounded-lg text-center w-full max-w-2xl">
            <LiveReactions leagueId={leagueId} />
          </div>
        </div>
       )}
      </main>
    </div>
  );
};

export default LiveDraw;