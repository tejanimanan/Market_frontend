// scriptService.ts

import { SCRIPT_URL } from '../Constants/API_URL';
import Axiosclient from '../utils/api/Axiosclient';

interface ScriptData {
  [key: string]: any;
}

interface ScriptResponse {
  data: any;
  total: number;
}

interface GetAllScriptsParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sortField?: string;
  sortOrder?: string;
}

export const createScript = async (data: ScriptData): Promise<any> => {
  const response = await Axiosclient.post(SCRIPT_URL.CREATE, { ...data });
  return response;
};

export const updateScript = async (id: string, data: ScriptData): Promise<any> => {
  const response = await Axiosclient.post(SCRIPT_URL.UPDATE, { id, ...data });
  return response;
};

export const deleteScript = async (id: string): Promise<any> => {
  const response = await Axiosclient.post(SCRIPT_URL.DELETE, { id });
  return response;
};

export const getAllScripts = async ({
  pageNumber,
  pageSize,
  search,
  sortField,
  sortOrder,
}: GetAllScriptsParams): Promise<ScriptResponse> => {
  const response = await Axiosclient.post(SCRIPT_URL.GET_ALL, {
    page: pageNumber,
    limit: pageSize,
    search,
    sortOrder,
    sortField,
  });

  return {
    data: response?.data?.data,
    total: response?.data?.total
  };
};

export const fetchStockDetails = async (): Promise<any[]> => {
  const response = await Axiosclient.post("/script/fetch-stock-details");
  return response?.data || [];
};

