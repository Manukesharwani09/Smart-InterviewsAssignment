export interface ApiResponse<TData> {
  statusCode: number;
  message: string;
  data: TData;
  success?: boolean;
}

export interface AuthUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSuccessPayload {
  user: AuthUser;
  accessToken: string;
}

export interface AuthUserResponse {
  user: AuthUser;
}

export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}
