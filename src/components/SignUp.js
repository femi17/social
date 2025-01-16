import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Image, BookOpen, AlertCircle } from 'lucide-react';
import { signup, googleLogin, fetchLeagues, fetchCreatorsInLeague } from '../apiUtils';
import logo from '../assets/logo.png';

const SignUp = ({ userType }) => {
  const [googleSignUpData, setGoogleSignUpData] = useState(null);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [creators, setCreators] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profilePicture: null,
    bio: '',
    is_creator: userType === 'creator',
    is_fan: userType === 'fan'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const fetchedLeagues = await fetchLeagues();
        setLeagues(fetchedLeagues);
      } catch (error) {
        console.error('Error fetching leagues:', error);
        setError('Failed to load leagues. Please try again.');
      }
    };
    loadLeagues();
  }, []);

  useEffect(() => {
    const loadCreators = async () => {
      if (selectedLeague && userType === 'fan') {
        try {
          const fetchedCreators = await fetchCreatorsInLeague(selectedLeague);
          setCreators(fetchedCreators);
        } catch (error) {
          console.error('Error fetching creators:', error);
          setError('Failed to load creators. Please try again.');
        }
      }
    };
    loadCreators();
  }, [selectedLeague, userType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      profilePicture: e.target.files[0]
    }));
  };

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        setGoogleSignUpData(userInfo.data);
        if (userType === 'creator') {
          setStep(3);
        } else {
          const response = await googleLogin(userInfo.data, false);
          handleSignupSuccess(response);
        }
      } catch (error) {
        console.error("Google login error:", error);
        handleError(error);
      }
    },
    onError: (error) => {
      console.error('Google Sign-In Failed:', error);
      setError('Google sign-in failed. Please try again.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < (userType === 'creator' ? 3 : 2)) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        let response;
        if (googleSignUpData) {
          response = await googleLogin({
            ...googleSignUpData,
            is_creator: userType === 'creator',
            league: formData.league,
            followed_creator: userType === 'fan' ? selectedCreator : null
          }, userType === 'creator', formData.league);
        } else {
          const formDataToSend = new FormData();
          for (const key in formData) {
            formDataToSend.append(key, formData[key]);
          }
          formDataToSend.append('is_creator', userType === 'creator');
          if (userType === 'fan') {
            formDataToSend.append('league', selectedLeague);
            formDataToSend.append('followed_creator', selectedCreator);
          }
          response = await signup(formDataToSend);
        }
        handleSignupSuccess(response);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignupSuccess = (data) => {
    console.log("Signup success data:", data);
    if (data && data.access) {
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('user_id', data.user_id || '');
      localStorage.setItem('is_creator', data.is_creator);
      localStorage.setItem('is_fan', data.is_fan);
      if (data.is_creator) {
        navigate('/creator-dashboard');
      } else {
        navigate('/fan-dashboard');
      }
    } else {
      console.error("Invalid response data:", data);
      setError('Invalid response from server. Please try again.');
    }
  };

  const handleError = (error) => {
    console.error('Error:', error);
    if (error.response && error.response.data) {
      setError(error.response.data.error || 'An error occurred. Please try again.');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <Link to="/">
            <img src={logo} alt="Logo" className="mx-auto h-12 w-auto" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign up as a {userType}
          </h2>
        </div>
        
        <button
          onClick={() => handleGoogleSignIn()}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
          Sign up with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <div className="relative">
                  <User className="absolute top-3 left-3 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="pl-10 appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-10 appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && userType === 'creator' && (
            <>
              <div>
                <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
                <div className="mt-1 flex items-center">
                  <Image className="w-12 h-12 text-gray-400" />
                  <input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && userType === 'fan' && (
            <>
              <label htmlFor="league" className="block text-sm font-medium text-gray-700">League of Interest</label>
              <div className="relative">
                <BookOpen className="absolute top-3 left-3 text-gray-400" />
                <select
                  id="league"
                  name="league"
                  className="pl-10 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  required
                >
                  <option value="">Select a league</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>{league.name}</option>
                  ))}
                </select>
              </div>

              {selectedLeague && (
                <>
                  <label htmlFor="creator" className="block text-sm font-medium text-gray-700 mt-4">Creator to Follow</label>
                  <div className="relative">
                    <User className="absolute top-3 left-3 text-gray-400" />
                    <select
                      id="creator"
                      name="creator"
                      className="pl-10 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={selectedCreator}
                      onChange={(e) => setSelectedCreator(e.target.value)}
                      required
                    >
                      <option value="">Select a creator to follow</option>
                      {creators.map((creator) => (
                        <option key={creator.id} value={creator.id}>{creator.username}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          {step === 3 && userType === 'creator' && (
            <div>
              <label htmlFor="league" className="block text-sm font-medium text-gray-700">Choose a League</label>
              <div className="relative">
                <BookOpen className="absolute top-3 left-3 text-gray-400" />
                <select
                  id="league"
                  name="league"
                  className="pl-10 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.league}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a league</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id.toString()}>
                      {league.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {step < (userType === 'creator' ? 3 : 2) ? 'Next' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <p className="font-medium text-indigo-600 hover:text-indigo-500">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;