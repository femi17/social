import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CreatorDashboard from './components/CreatorDashboard';
import LiveDraw from './components/LiveDraw';
import LeagueRules from './components/LeagueRules';
import LeagueDetails from './components/LeagueDetails';
import Fixtures from './components/Fixtures';
import Feed from './components/Feed';
import CreatorProfile from './components/CreatorProfile';
import FanDashboard from './components/FanDashboard';
import MatchDetails from './components/MatchDetails';
import ChampionshipBracket from './components/ChampionshipBracket';
import QualificationProgress from './components/QualificationProgress';

function App() {
  return (
    <GoogleOAuthProvider clientId="60638466810-8je3qo205nns1ehbid5ql14agtsr1gsg.apps.googleusercontent.com">
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup/creator" element={<SignUp userType="creator" />} />
            <Route path="/signup/fan" element={<SignUp userType="fan" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/creator-dashboard" element={<CreatorDashboard />} />
            <Route path="/live-draw/:leagueId" element={<LiveDraw />} />
            <Route path="/league-rules" element={<LeagueRules />} />
            <Route path="/league-details/:leagueId/:userId" element={<LeagueDetails />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/creator/:creatorId" element={<CreatorProfile />} />
            <Route path="/fan-dashboard/" element={<FanDashboard />} />
            <Route path="/match/:matchId" element={<MatchDetails />} />
            <Route path="/championship/:leagueId" element={<ChampionshipBracket />} />
            <Route path="/qualification/:leagueId" element={<QualificationProgress />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;