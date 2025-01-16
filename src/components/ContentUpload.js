import React, { useState, useEffect } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { fetchNextMatch, uploadContent } from '../apiUtils';

const ContentUpload = ({ userId }) => {
  const [nextMatch, setNextMatch] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const matchData = await fetchNextMatch(userId);
        setNextMatch(matchData);
      } catch (err) {
        setError('Failed to fetch next match data: ' + err.message);
      }
    };

    fetchMatchData();
  }, [userId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) { // 100 MB limit
        setError('File size exceeds 100 MB limit');
      } else {
        setFile(selectedFile);
        setError(null);
      }
    }
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      await uploadContent(nextMatch.id, file);
      setSuccess(true);
      setFile(null);
    } catch (err) {
      setError('Failed to upload content: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const isUploadAllowed = () => {
    if (!nextMatch) return false;
    const now = new Date();
    const matchDate = new Date(nextMatch.scheduled_time);
    return now.toDateString() === matchDate.toDateString() && now < matchDate;
  };

  if (!nextMatch) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="mr-2" size={20} /> Content Upload
        </h3>
        <p className="text-sm text-gray-400">No upcoming matches found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Upload className="mr-2" size={20} /> Content Upload
      </h3>
      <div className="mb-4">
        {!isUploadAllowed() && (
          <p className="text-sm text-gray-400 flex items-center mt-2">
            <Clock className="mr-2" size={14} />
            Only allowed on match day before it starts.
          </p>
        )}
      </div>
      <div className="flex items-center mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="content-upload"
          accept="video/*,image/*"
          disabled={!isUploadAllowed()}
        />
        <label
          htmlFor="content-upload"
          className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer ${!isUploadAllowed() && 'opacity-50 cursor-not-allowed'}`}
        >
          Select File
        </label>
        {file && (
          <div className="ml-4 flex items-center">
            <span className="text-gray-300">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="ml-2 text-red-500 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      <button
        onClick={handleUpload}
        disabled={!file || uploading || !isUploadAllowed()}
        className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ${
          (!file || uploading || !isUploadAllowed()) && 'opacity-50 cursor-not-allowed'
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && (
        <div className="mt-2 flex items-center text-red-500">
          <AlertCircle size={16} className="mr-2" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="mt-2 flex items-center text-green-500">
          <CheckCircle size={16} className="mr-2" />
          <p>You have uploaded your content!👏🤞</p>
        </div>
      )}
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Upload Guidelines:</h4>
        <ul className="list-disc list-inside text-sm text-gray-400">
          <li>Maximum file size: 100 MB</li>
          <li>Accepted formats: Images (jpg, png, gif) and Videos (mp4, mov)</li>
          <li>Content must be related to the upcoming match</li>
          <li>Ensure your content adheres to community guidelines</li>
        </ul>
      </div>
    </div>
  );
};

export default ContentUpload;