import { API_URL } from '../Constants/API_URL';
import axiosInstance from '../utils/api/Axiosclient';

export const login = (data: { email: string; password: string }) => axiosInstance.post(API_URL.LOGIN, data);

// export const logout = () => axiosInstance.post('/auth/logout'); 