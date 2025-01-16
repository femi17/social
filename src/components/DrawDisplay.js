import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

const DrawDisplay = ({ drawnCreator, assignedDivision, animationState, showCard }) => {
  if (!showCard) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white text-center mt-2" style={{ height: '150px' }}>
      <motion.div
        className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl shadow-inner"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: animationState !== 'idle' ? 1 : 0,
          scale: animationState !== 'idle' ? 1 : 0.8,
        }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {animationState === 'drawing' && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-xl font-bold mb-2">Drawing Creator...</h3>
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            </motion.div>
          )}
          {animationState === 'assigning' && (
            <motion.div
              key="assigning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-xl font-bold mb-2">Assigning to...</h3>
              <div className="flex justify-center items-center space-x-4">
                <ProfilePicture user={drawnCreator} size="medium" />
                <p>{drawnCreator?.username}</p>
                <ArrowRight size={24} />
                <div className="bg-white text-indigo-600 font-bold py-2 px-4 rounded">
                  {assignedDivision?.name}
                </div>
              </div>
            </motion.div>
          )}
          {animationState === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-xl font-bold mb-2">Assignment Complete!</h3>
              <p>Let the battle begin! ✨</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DrawDisplay;