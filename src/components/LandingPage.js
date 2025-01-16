import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo-white.png';

const LandingPage = () => {
  const [activeContent, setActiveContent] = useState('default');
  const currentYear = new Date().getFullYear();

  const contentMap = {
    default: {
      title: "Where Creativity Meets Competition",
      content: (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="space-y-4 text-lg"
        >
          <p>Join the revolution in digital entertainment:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Showcase your talents</li>
            <li>Compete with creators worldwide</li>
            <li>Engage in league-based competitions</li>
            <li>Experience automated TV show production</li>
            <li>Connect with brands for unique collaborations</li>
          </ul>
        </motion.div>
      )
    },
    howItWorks: {
      title: "How It Works",
      content: (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="space-y-4 text-lg"
        >
          <p>Scropoll operates through a seamless process:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Creators sign up and choose a league</li>
            <li>Participate in live draws for division assignments</li>
            <li>Compete in scheduled matches by uploading content</li>
            <li>Fans vote on their favorite content</li>
            <li>Creators earn points, climb the rankings, and potentially get promoted or relegated</li>
          </ol>
        </motion.div>
      )
    },
    vision: {
      title: "Our Vision",
      content: (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="space-y-4 text-lg"
        >
          <p>At Scropoll, we envision a future where creativity knows no bounds. Our aim is to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Establish Scropoll as the epicenter of digital entertainment</li>
            <li>Empower creators to reach their highest potential</li>
            <li>Captivate audiences with innovative content</li>
            <li>Revolutionize how creators showcase their talents</li>
            <li>Transform the way audiences engage with content</li>
          </ul>
        </motion.div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full space-y-8">
        <div className="flex flex-col md:flex-row items-stretch justify-between">
          {/* Left side - Dynamic content */}
          <div className="md:w-7/12 space-y-6 text-white pr-8">
            <motion.img 
              src={logo} 
              alt="Logo" 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.h2 
              className="text-3xl font-bold text-white mb-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {contentMap[activeContent].title}
            </motion.h2>
            {contentMap[activeContent].content}
          </div>

          {/* Right side - Longer, slightly slimmer card */}
          <div className="md:w-5/12 mt-8 md:mt-0 flex flex-col">
            <motion.div 
              className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-5 flex-grow flex flex-col justify-between"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Scropoll {currentYear}</h2>
                
                <button 
                  onClick={() => setActiveContent('default')} 
                  className={`w-full ${activeContent === 'default' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white font-bold py-3 px-4 rounded flex justify-between items-center mb-4`}
                >
                  <span>What's new in Scropoll</span>
                  <ArrowRight size={20} />
                </button> 

                <Link to="/signup/creator" className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded text-center mb-4">
                  START AS CREATOR
                </Link>

                <Link to="/signup/fan" className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded text-center mb-4">
                  START AS FAN
                </Link>

                <Link to="/login" className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded text-center mb-4">
                  BUY A LEAGUE
                </Link>

                <Link to="/login" className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded text-center">
                  LOGIN
                </Link>
              </div>

              <div className="flex justify-between mt-auto pt-4">
                <button 
                  className={`text-gray-400 hover:text-white ${activeContent === 'howItWorks' ? 'text-white' : ''}`}
                  onClick={() => setActiveContent('howItWorks')}
                >
                  How It Works
                </button>
                <button 
                  className={`text-gray-400 hover:text-white ${activeContent === 'vision' ? 'text-white' : ''}`}
                  onClick={() => setActiveContent('vision')}
                >
                  Our Vision
                </button>
                <button className="text-gray-400 hover:text-white">
                  Our Leagues
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer with Prize Link */}
        <motion.div 
          className="mt-10 text-center text-gray-300 flex flex-col items-center space-y-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p>&copy; {currentYear} Scropoll v1.0 | All rights reserved</p>
          <Link to="/prizes" className="flex items-center text-indigo-300 hover:text-indigo-100 transition-colors duration-300">
            <Gift size={20} className="mr-2" />
            <span>View Available Prizes</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;