import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here if needed, for example, to handle errors globally
// or to add authorization tokens to requests.

// Example of an error interceptor:
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle errors
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
