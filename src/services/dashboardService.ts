import { DASHBOARD_URL } from '../Constants/API_URL';
import axiosInstance from '../utils/api/Axiosclient';

interface ResetPasswordParams {
  email: any;
  oldPassword: any;
  newPassword: any;
}

export const getAllUsersCount = async (): Promise<any> => {
  const response = await axiosInstance.post(DASHBOARD_URL.GET_COUNTER);
  return response?.data;
};
  
export const resetPassword = async ({ email, oldPassword, newPassword }: ResetPasswordParams): Promise<any> => {
  const response = await axiosInstance.post(DASHBOARD_URL.RESET_PASSWORD, { oldPassword, newPassword, email });
  return response?.data;
}; 

export const getDashboardChart = async (symbol: string): Promise<any> => {
  const response = await axiosInstance.get(DASHBOARD_URL.CHART, {
    params: { symbol }, // ✅ Correct way to send query param
  });
  // console.log("response",response)
  return response?.data;
};
