'use client'

// tools/ api.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  timeout: 5000, // Timeout if necessary
  headers: {
    'ContentType': 'application/json',
    'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTAxOTU3Njc1Iiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MjQ4MzEzMzQsImV4cCI6MTcyNDg0MjEzNCwidHlwZSI6IkFDQ0VTUyJ9.JaQNaMBO8TsBlujkN__BzsUfIxYly9Btg93FBzUMBYM',
    // Add all custom headers here
  },
});

export default axiosInstance;