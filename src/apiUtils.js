import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://scropoll.pythonanywhere.com/api';


export const signup = async (formData) => {
  try {
    // If the user is a creator and has selected a league, ensure it's included in the form data
    if (formData.get('is_creator') === 'true' && formData.get('league')) {
      formData.set('league', formData.get('league'));
    }

    const response = await axios.post(`${API_BASE_URL}/register/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/login/`, { username, password });
  return response.data;
};

export const googleLogin = async (userInfo, isCreator = false, leagueId = null) => {
  try {
    console.log(`Sending Google login request. User email: ${userInfo.email}, isCreator: ${isCreator}, leagueId: ${leagueId}`);
    const response = await axios.post(`${API_BASE_URL}/google-login/`, {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      is_creator: isCreator,
      league: leagueId
    });
    console.log("Google login response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Google login error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const selectLeague = async (leagueId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_BASE_URL}/select-league/`, { league_id: leagueId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchLeagues = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leagues/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    throw error;
  }
};

export const fetchUserDetails = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/user-details/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const fetchUserLeagueInfo = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/user-league-info/`, {
      headers: { Authorization: `Bearer ${token}` }
    });   
    return response.data;
  } catch (error) {
    console.error('Error fetching user league info:', error);
    throw error;
  }
};


export const fetchLiveDrawData = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/live-draw-data/${leagueId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return {
      ...response.data,
      serverTime: new Date(response.headers['date']).getTime(),
      clientTime: Date.now()
    };
  } catch (error) {
    console.error('Error fetching live draw data:', error);
    throw error;
  }
};


export const startLeagueDraw = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/leagues/${leagueId}/start-draw/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error starting league draw:', error);
    throw error;
  }
};



export const performLeagueDraw = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/leagues/${leagueId}/perform-draw/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error performing league draw:', error);
    throw error;
  }
};


export const getDrawResults = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/leagues/${leagueId}/draw-results/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching draw results:', error);
    throw error;
  }
};

export const assignDivision = async (leagueId, creatorId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await axios.post(`${API_BASE_URL}/leagues/${leagueId}/assign-division/`, 
      { creator_id: creatorId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error assigning division:', error);
    throw error;
  }
};

export const fetchLeagueTable = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/leagues/${leagueId}/division-table/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching division table:', error);
    throw error;
  }
};

export const fetchNextMatch = async (userId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/next-match/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching next match:', error);
    throw error;
  }
};

export const fetchLeagueDetails = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/leagues/${leagueId}/details/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching league details:', error);
    throw error;
  }
};

export const fetchFixtures = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/fixtures/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    throw error;
  }
};


export const uploadContent = async (matchId, file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('content', file);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/matches/${matchId}/upload-content/`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading content:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      throw new Error(error.response.data.error || 'An error occurred while uploading content');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error('Error in request setup');
    }
  }
};


export const fetchFeed = async (feedType = 'all', page = 1) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/feed/?type=${feedType}&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      results: response.data.results.map(item => ({
        ...item,
        season: item.season,
      })) || [],
      next: response.data.next,
    };
    
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
};

export const voteForMatch = async (contentId, voteChoice) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/vote/`, 
      { content_id: contentId, vote_choice: voteChoice },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error voting for match:', error);
    throw error;
  }
};

export const likeMatch = async (contentId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/like/`, 
      { content_id: contentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error liking match:', error);
    throw error;
  }
};

export const addComment = async (contentId, comment) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/comment/`, 
      { content_id: contentId, comment: comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// In apiUtils.js

export const fetchCreatorProfile = async (creatorId) => {
  const token = localStorage.getItem('token');
  try {
    const [profileResponse, contentResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/creators/${creatorId}/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_BASE_URL}/creators/${creatorId}/content/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    return {
      ...profileResponse.data,
      content: contentResponse.data
    };
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    throw error;
  }
};


export const updateProfilePicture = async (creatorId, file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('profile_picture', file);

  try {
    const response = await axios.put(`${API_BASE_URL}/creators/${creatorId}/profile-picture/`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
};

export const changePassword = async (creatorId, newPassword) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/creators/${creatorId}/change-password/`, {
      new_password: newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const deleteContent = async (contentId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.delete(`${API_BASE_URL}/content/${contentId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

export const fetchUpcomingMatches = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/upcoming-matches/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    throw error;
  }
};


export const addLiveReaction = async (leagueId, message) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/leagues/${leagueId}/live-reactions/add/`, 
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding live reaction:', error);
    throw error;
  }
};

export const getLiveReactions = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/leagues/${leagueId}/live-reactions/`, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching live reactions:', error);
    throw error;
  }
};

export const clearLiveReactions = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/leagues/${leagueId}/live-reactions/clear/`, 
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error clearing live reactions:', error);
    throw error;
  }
};


export const fetchNotifications = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/notifications/${notificationId}/mark-read/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};


export const shareContent = async (matchId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/matches/${matchId}/share/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error sharing content:', error);
    throw error;
  }
};


export const toggleContentLike = async (contentId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/content/${contentId}/toggle-like/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling content like:', error);
    throw error;
  }
};


export const fetchDivisions = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/divisions/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw error;
  }
};


export const fetchDivisionTable = async (divisionId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/divisions/${divisionId}/table/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching division table:', error);
    throw error;
  }
};



export const fetchFavoriteCreators = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/favorite-creators/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching favorite creators:', error);
    throw error;
  }
};

export const fetchLeagueStandings = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/league-standings/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching league standings:', error);
    throw error;
  }
};

export const fetchVotingHistory = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/voting-history/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching voting history:', error);
    throw error;
  }
};


export const followCreator = async (creatorId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/follow-creator/${creatorId}/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || error.response.data.message);
    }
    throw error;
  }
};


export const unfollowCreator = async (creatorId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/unfollow-creator/${creatorId}/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error unfollowing creator:', error);
    throw error;
  }
};


export const fetchFollowedCreators = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/followed-creators/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching followed creators:', error);
    throw error;
  }
};



export const fetchCreatorNextMatch = async (creatorId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/creators/${creatorId}/next-match/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No next match available for this creator");
      return null;
    }
    console.error('Error fetching creator next match:', error);
    throw error;
  }
};


export const fetchCreatorsInLeague = async (leagueId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leagues/${leagueId}/creators/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching creators in league:', error);
    throw error;
  }
};


export const fetchCreatorStats = async (creatorId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/creators/${creatorId}/stats/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No stats available for this creator");
      return null;
    }
    console.error('Error fetching creator stats:', error);
    throw error;
  }
};


export const fetchCreatorFollowersCount = async (creatorId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/creators/${creatorId}/followers-count/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.followers_count;
  } catch (error) {
    console.error('Error fetching creator followers count:', error);
    throw error;
  }
};


export const fetchMatches = async (leagueId, divisionId, dateString, type) => {
  const token = localStorage.getItem('token');
  try {
    console.log('API call params:', { leagueId, divisionId, dateString, type });
    const response = await axios.get(`${API_BASE_URL}/leagues/${leagueId}/divisions/${divisionId}/matches/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { date: dateString, type }
    });
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchMatches:', error.response || error);
    throw error;
  }
};


export const fetchMatchDetails = async (matchId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/matches/${matchId}/details/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching match details:', error);
    throw error;
  }
};


export const fetchChampionshipDetails = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/leagues/${leagueId}/championship/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching championship details:', error);
    throw error;
  }
};

export const fetchQualificationProgress = async (leagueId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE_URL}/leagues/${leagueId}/qualification-progress/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching qualification progress:', error);
    throw error;
  }
};


export const preregister = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/preregister/`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error('Signup error:', error.response ? error.response.data : error.message);
    throw error;
  }
};