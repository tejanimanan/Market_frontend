export const API_URL = {
  HOME: "/",
  LOGIN: "/auth/login",
} as const;
export const USER_URL = {
  CREATE_USER: "/user/create_user",
  GET_USER: "/user/user_list",
  UPDATE: "/user/update_user",
  DELETE: "/user/delete_user"
} as const;

export const SHARE_URL = {
  CREATE_SHARE: "/share_data/create",
  GET_SHARES: "/share_data/list",
  UPDATE: "/share_data/update",
  DELETE: "/share_data/delete",
  FIND_BY_USER_SCRIPT:"/share_data/find-by-user-script"
} as const;


export const SCRIPT_URL = {
  CREATE: '/script/create',
  UPDATE: '/script/update',
  DELETE: '/script/delete',
  GET_ALL: '/script/list'
} as const;


export const DASHBOARD_URL = {
  GET_COUNTER: "/user/dashboard",
  RESET_PASSWORD: "/auth/reset_password",
  CHART: "/script/chart",
} as const; 