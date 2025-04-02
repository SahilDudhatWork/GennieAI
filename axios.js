import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://node-auth-mu-brown.vercel.app',
});

api.interceptors.request.use(
  async config => {
    const accessToken = await AsyncStorage.getItem('token');

    if (accessToken) {
      let token = JSON.parse(accessToken);

      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => {
    const headers = response.headers;
    return response.data;
  },
  error => {
    return Promise.reject(error);
  },
);

export default api;
