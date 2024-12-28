import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Home = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [file, setFile] = useState(null);

  const API_BASE_URL = 'https://storage-service-180924265462.us-central1.run.app/api/storage';

  // Configure Axios interceptor to add user_id header
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      setUserId(decoded.sub);

      // Add Axios request interceptor
      axios.interceptors.request.use((config) => {
        if (decoded.sub) {
          config.headers['user_id'] = decoded.sub; // Add user_id in headers
        }
        return config;
      });

      fetchVideos(); // Fetch videos without explicitly passing user_id
    }
  }, []);

  // Fetch videos from backend
  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/videos`);
      setVideos(response.data);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) return;

    try {
      // Generate the URL
      const generateUrlResponse = await axios.post(`${API_BASE_URL}/generateUrl`, {
        file_name: file.name, // Send file_name in the body
      });

      const uploadUrl = generateUrlResponse.data.url;

      // Upload the file
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      alert('Video uploaded successfully!');
      fetchVideos(); // Refresh video list
    } catch (err) {
      console.error('Error uploading video:', err);
    }
  };

  // Delete video
  const handleDeleteVideo = async (fileName) => {
    try {
      await axios.delete(`${API_BASE_URL}/videos`, {
        data: { file_name: fileName }, // Send file_name in the body
      });
      alert('Video deleted successfully!');
      fetchVideos(); // Refresh video list
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  // Open modal to play video
  const openModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
  };

  // Close modal
  const closeModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold">Welcome, {username}</h1>

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
            className="px-4 py-2 mt-2 font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Upload
          </button>
        </div>

        <h2 className="mt-6 text-xl font-semibold">Your Videos</h2>
        <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
          {videos.map((video) => (
            <div key={video.id} className="p-4 bg-white shadow rounded">
              <p className="text-sm font-medium">{video.name}</p>
              <button
                onClick={() => openModal(video.url)}
                className="mt-2 text-blue-600 hover:underline"
              >
                Play
              </button>
              <button
                onClick={() => handleDeleteVideo(video.name)}
                className="ml-2 text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-4">
            <video controls className="w-full">
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
