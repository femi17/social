import React from 'react';
import { Link } from 'react-router-dom';
import { Home, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import Notification from './Notification';

const Navigation = ({ userDetails, ProfilePicture }) => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_id');
        localStorage.removeItem('is_creator');
        localStorage.removeItem('is_fan');
        navigate('/');
      };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="" />
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/feed" className="p-1 rounded-full text-gray-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                        <Home size={20} className="text-gray-500" />
                    </Link>
                    <Link to={`/${userDetails.is_creator ? 'creator' : 'fan'}-dashboard`} className="p-1 rounded-full text-gray-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    >
                        <User size={20} className="text-gray-500" />
                    </Link>
                    <Notification />
                    {userDetails && (
                        <div className="flex items-center space-x-2">
                            <Link to={`/creator/${userDetails.id}`}>
                                <ProfilePicture user={userDetails} />
                            </Link>
                            <LogOut size={20} onClick={handleLogout} className="text-gray-500 cursor-pointer" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    </header>

  );
};

export default Navigation;