import axios from 'axios';
import {Store} from '@reduxjs/toolkit';
import {RootState} from './app/store';

const axiosApi = axios.create({
  baseURL: 'http://localhost:8000',
});

export const addInterceptors = (store: Store<RootState>) => {
  axiosApi.interceptors.request.use((request) => {
    const token = store.getState().users.user?.token;
    request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  });
};

export default axiosApi;