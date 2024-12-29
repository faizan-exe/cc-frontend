// Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import StorageStatus from '../../components/StorageMonitor';

const Home = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [file, setFile] = useState(null);
  const [usedStorage, setUsedStorage] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'https://storage-service-180924265462.us-central1.run.app/api/storage';
  const MAX_STORAGE_LIMIT_MB = 50;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      setUserId(decoded.sub);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchVideos();
    }
  }, [userId]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/videos`, {
        params: {
          user_id: userId,
          username: username, // Send username in the query string
        },
      });

      const videoList = response.data.videos;
      setVideos(videoList);

      const totalUsed = videoList.reduce(
        (acc, video) => acc + parseInt(video.size || 0),
        0
      );
      setUsedStorage(totalUsed / (1024 * 1024)); // Convert to MB
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024); // Convert size to MB
    const totalUsedAfterUpload = usedStorage + fileSizeMB;

    if (totalUsedAfterUpload > MAX_STORAGE_LIMIT_MB) {
      alert(
        'Uploading this video would exceed your storage limit. Delete some videos to upload more.'
      );
      return;
    }

    if (totalUsedAfterUpload > MAX_STORAGE_LIMIT_MB * 0.8) {
      alert(
        'You are using more than 80% of your storage limit. Consider managing your files.'
      );
    }

    setLoading(true);
    try {
      const generateUrlResponse = await axios.post(`${API_BASE_URL}/generateUrl`, {
        file_name: file.name,
        user_id: userId,
        username: username, // Send username in the body
      });

      const uploadUrl = generateUrlResponse.data.signedUrl;

      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      alert('Video uploaded successfully!');
      fetchVideos(); // Refresh the video list
    } catch (err) {
      console.error('Error uploading video:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (fileName) => {
    try {
      await axios.delete(`${API_BASE_URL}/videos`, {
        data: {
          file_name: fileName,
          user_id: userId,
        },
        username: username, // Send username in the body
      });
      alert('Video deleted successfully!');
      fetchVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const openModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  const extractVideoName = (url) => {
    try {
      const path = url.split('/o/')[1];
      const videoName = path.split('?')[0];
      return decodeURIComponent(videoName);
    } catch (error) {
      console.error('Error extracting video name:', error);
      return 'Unknown Video';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold">Welcome, {username}</h1>

        <StorageStatus usedStorage={usedStorage} maxStorage={MAX_STORAGE_LIMIT_MB} />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-2"
          />
          <button
            onClick={handleFileUpload}
            className={`px-4 py-2 mt-2 font-bold text-white ${
              loading ? 'bg-gray-600' : 'bg-indigo-600'
            } rounded ml-4`}
            disabled={loading} // Disable the button when loading is true
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        <h2 className="mt-6 text-xl font-semibold">Your Videos</h2>
        <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div key={video.id} className="p-4 bg-white shadow rounded">
                <p className="text-sm font-medium">
                  {extractVideoName(video.url)}
                </p>
                <button
                  onClick={() => openModal(video.url)}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Play
                </button>
                <button
                  onClick={() => handleDeleteVideo(extractVideoName(video.url))}
                  className="ml-2 text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No videos Uploaded</p>
          )}
        </div>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-4 max-h-[80vh]">
            <video controls className="w-full max-h-[60vh]">
              <source src={selectedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button
              onClick={closeModal}
              className="px-4 py-2 mt-4 font-bold text-white bg-red-600 rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
