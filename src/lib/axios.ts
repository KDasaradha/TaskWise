import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Log the API_BASE_URL to console for debugging purposes
if (typeof window !== 'undefined') { // Ensure this only runs on client-side
  console.log("Attempting to use API_BASE_URL for Axios:", API_BASE_URL);
}


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for logging
axiosInstance.interceptors.request.use(request => {
  if (typeof window !== 'undefined') {
    console.log(`Starting Request to: ${request.baseURL}${request.url}`, `Method: ${request.method}`);
    // console.log('Request Headers:', request.headers);
    // if (request.data) {
    //   console.log('Request Data:', request.data);
    // }
  }
  return request;
}, error => {
  if (typeof window !== 'undefined') {
    console.error('Axios Request Error:', error);
  }
  return Promise.reject(error);
});

// Add a response interceptor for logging
axiosInstance.interceptors.response.use(response => {
  // if (typeof window !== 'undefined') {
  //   console.log('Response from:', response.config.url, 'Status:', response.status);
  // }
  return response;
}, error => {
  if (typeof window !== 'undefined') {
    console.error('Axios Response Error:', error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      // console.error('Error Response Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      let targetUrl = '';
      if (error.config) {
        targetUrl = error.config.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config.url;
      }
      console.error('No response received for request. Target URL (if available):', targetUrl || 'N/A');
      console.error('Error Request Object:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error during request setup:', error.message);
    }
    // console.error('Full Axios error config:', error.config);
  }
  return Promise.reject(error);
});

export default axiosInstance;
