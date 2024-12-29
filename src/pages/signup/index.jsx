import React, { useState } from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
  
    try {
      // First API call for user signup
      const response = await axios.post(
        'https://user-service-180924265462.us-central1.run.app/auth/signUp',
        formData
      );
  
      console.log(response);
  
      if (response.status === 200) {
        setSuccessMessage('Sign-up successful! Please sign in.');
        setFormData({ username: '', password: '' });
  
        // Second API call for creating storage bucket
        try {
          const storageBucketCreate = await axios.post(
            'https://storage-service-180924265462.us-central1.run.app/api/storage',
            {
              name: formData.username,
              user_id: response.data.id,
              username : formData.username
            },
          );
  
          if (storageBucketCreate.status === 200) {
            console.log('Bucket Created!!!');
          }
        } catch (storageError) {
          console.error('Error creating storage bucket:', storageError);
        }
  
        // Navigate to home route
        navigate('/');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Sign-up failed. Please try again.';
      setError(errorMessage);
    }
  };
  
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign Up</h2>
        {error && (
          <div className="p-4 mt-4 text-sm text-red-600 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-4 mt-4 text-sm text-green-600 bg-green-100 border border-green-400 rounded">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 mt-6 font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to={'/'} className="text-indigo-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
