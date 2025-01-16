import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import ProfilePicture from './ProfilePicture';
import { motion, AnimatePresence } from 'framer-motion';

const CommentModal = ({ isOpen, onClose, comments, contentId, handleComment, userDetails }) => {
  const [newComment, setNewComment] = useState('');

  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      handleComment(contentId, newComment);
      setNewComment('');
    }
  };

  // Animation variants for modal slide-up effect
  const modalVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: { opacity: 1, y: '0%' },
    exit: { opacity: 0, y: '100%' }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            ref={modalRef}
            className="bg-white rounded-t-lg w-full max-w-md h-[80vh] flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 100, damping: 20, duration: 0.5 }}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Comments</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
              {comments.map((comment, index) => (
                <div key={index} className="flex items-start mb-4">
                  <ProfilePicture user={comment} size="small" />
                  <div className="ml-3 bg-gray-100 rounded-lg p-3 flex-grow">
                    <p className="font-semibold text-black">{comment.username}</p>
                    <p className='text-black'>{comment.comment}</p>
                    <p className="text-xs text-gray-400">{new Date(comment.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitComment} className="border-t p-4 text-black flex items-center">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow border rounded-full px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentModal;
