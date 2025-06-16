import { USER_URL } from '../Constants/API_URL';
import Axiosclient from '../utils/api/Axiosclient';


interface UserData {
  [key: string]: any;
}

interface UserResponse {
  data: any;
  total: number;
}

interface GetAllUsersParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sortField?: string;
  sortOrder?: string;
}

export const createUser = async (data: UserData): Promise<any> => {
  const response = await Axiosclient.post(USER_URL.CREATE_USER, { ...data });
  
  return response;
};

export const updateUser = async (id: number, data: UserData): Promise<any> => {
  const response = await Axiosclient.post(USER_URL.UPDATE, { id, ...data });
  return response;
};

export const deleteUser = async (id: number): Promise<any> => {
  const response = await Axiosclient.post(USER_URL.DELETE, { id: id });
  return response;
};

export const getAllUsers = async ({
  pageNumber,
  pageSize,
  search,
  sortField,
  sortOrder
}: GetAllUsersParams): Promise<UserResponse> => {
  const response = await Axiosclient.post(USER_URL.GET_USER, {
    page: pageNumber,
    limit: pageSize,
    search,
    sortOrder,
    sortField
  });
  
  return {
    data: response?.data?.data,
    total: response?.data?.total
  };
}; 