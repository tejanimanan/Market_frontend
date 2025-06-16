import { SHARE_URL } from '../Constants/API_URL';
import Axiosclient from '../utils/api/Axiosclient';
import type { ShareData } from '../redux/slices/shareSlice';
import axios from 'axios';
// import { API_URL } from '../Constants/API_URL';

interface GetAllSharesParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sortField?: string;
  sortOrder?: string;
  userId?: string;
  scriptId?: string;
  startDate?: string;  // Add this
  endDate?: string;  
}

// interface ApiResponse {
//   data: any[];
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// }
export const getAllShares = async ({
  pageNumber,
  pageSize,
  search,
  sortField,
  sortOrder,
  userId,
  scriptId,
   startDate,          
  endDate,  
}: GetAllSharesParams): Promise<{ data: any; total: number }> => {
  const response = await Axiosclient.post(SHARE_URL.GET_SHARES, {
    page: pageNumber,
    limit: pageSize,
    search,
    sortOrder,
    sortField,
    user_id: userId ? parseInt(userId) : undefined,
    script_id: scriptId ? parseInt(scriptId) : undefined,
    start_date: startDate, 
    end_date: endDate,    
  });

  return {
    data: response?.data?.data,
    total: response?.data?.total
  };
};

export const createShare = async (data: Omit<ShareData, 'key' | 'user' | 'script' | 'create_date' | 'updated_date'>): Promise<ShareData> => {
  const response = await Axiosclient.post(SHARE_URL.CREATE_SHARE, data);
  return response.data;
};

export const updateShare = async (data: { id: number } & Omit<ShareData, 'id' | 'user' | 'script' | 'create_date' | 'updated_date'>): Promise<ShareData> => {
  const response = await Axiosclient.post(SHARE_URL.UPDATE, data);
  return response.data;
};

export const deleteShare = async (id: string): Promise<void> => {
  await Axiosclient.post(`${SHARE_URL.DELETE}`, { id });
};

export const findSharesByUserScript = async (user_id: number, script_id: number) => {
  try {
    const response = await Axiosclient.post(SHARE_URL.FIND_BY_USER_SCRIPT, {
      user_id,
      script_id
    });
   
    return response.data;
  } catch (error) {
    console.error('Error fetching shares by user and script:', error);
    throw error;
  }
}; 