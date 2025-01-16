import React, { useState, useRef } from 'react';
import { Play, Pause, VolumeX, Volume2 } from 'lucide-react';

const CustomVideoPlayer = ({ url }) => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
      />
  
      <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlay}>
        {!playing && (
          <button
            className="text-white bg-black bg-opacity-50 rounded-full p-3 lg:p-4"  // p-3 for mobile, p-4 for desktop
          >
            <Play className="w-4 h-4 lg:w-7 lg:h-7" /> 
          </button>
        )}
      </div>
  
      {/* Volume Icon: smaller on mobile, larger on desktop */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={toggleMute}
          className="text-white bg-black bg-opacity-50 rounded-full p-1.5 lg:p-2"
        >
          {muted ? (
            <VolumeX className="w-3 h-3 lg:w-5 lg:h-5" />
          ) : (
            <Volume2 className="w-3 h-3 lg:w-5 lg:h-5" /> 
          )}
        </button>
      </div>
    </div>
  );
  
};

export default CustomVideoPlayer;