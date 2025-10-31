export interface LoginRequest {
 email: string;
 password: string;
}
export interface AuthUser {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  location?: string;
  territory?: string;
  region?: string;
  zone?: string;
  state?: string;
  reportsTo?: string;
  isActive: boolean;
  joinDate?: string;
}
export interface LoginResponse {
 accessToken: string;
 refreshToken: string;
 authUser: AuthUser;
}