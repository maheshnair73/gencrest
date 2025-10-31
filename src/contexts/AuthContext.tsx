/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRoleByCode } from '../types/hierarchy';
import { AuthUser } from '../services/apiTypes';
import { apiBaseUrl, fetchWithAuth } from '../services/apiService';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (module: string, action: string) => boolean;
  canApprove: (submitterRole: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name && parsedUser.role) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          console.log('Invalid user data in localStorage, clearing...');
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Failed to parse stored user, clearing localStorage:', error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<any> => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email:username, password }),
      });

      if (response.status!=200) {
        console.error('Login failed:', response.statusText);
        return false;
      }
      
      const data = await response.json();
      console.log('Login response:', data);
      if(data.status=='P'){
        return 'P';
      }
      if (data.accessToken && data.authUser) {
        setUser(data.authUser);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('authUser', JSON.stringify(data.authUser));
        return true;
      } else {
        console.error('Login response missing accessToken or user data');
        return false;
      }
    } catch (error) {
      console.log('Backend API not available, using demo mode');

      const mockUsers: Record<string, { password: string; user: AuthUser }> = {
        'mdo': {
          password: 'mdo',
          user: {
            id: 'user-001',
            employeeCode: 'EMP001',
            name: 'Rajesh Kumar',
            role: 'MDO',
            email: 'mdo@example.com',
            phone: '+91 98765 43210',
            location: 'Rohini',
            territory: 'North Delhi',
            region: 'NCR',
            zone: 'North Zone',
            state: 'Delhi',
            isActive: true
          }
        },
        'mdo_ap': {
          password: 'mdo_ap',
          user: {
            id: 'user-002',
            employeeCode: 'EMP002',
            name: 'Gabannagaru Thimmappa',
            role: 'MDO',
            email: 'mdo_ap@example.com',
            phone: '+91 98765 43211',
            location: 'Anantapur City',
            territory: 'Anantapur',
            region: 'Rayalaseema',
            zone: 'Andhra Pradesh',
            state: 'Andhra Pradesh',
            isActive: true
          }
        },
        'tsm': {
          password: 'tsm',
          user: {
            id: 'user-003',
            employeeCode: 'EMP003',
            name: 'Priya Sharma',
            role: 'TSM',
            email: 'tsm@example.com',
            phone: '+91 98765 43212',
            territory: 'Delhi Territory',
            region: 'NCR',
            zone: 'North Zone',
            state: 'Delhi',
            isActive: true
          }
        },
        'tsm_ap': {
          password: 'tsm_ap',
          user: {
            id: 'user-004',
            employeeCode: 'EMP004',
            name: 'Lakshmi Narayana',
            role: 'TSM',
            email: 'tsm_ap@example.com',
            phone: '+91 98765 43213',
            territory: 'Anantapur District',
            region: 'Rayalaseema',
            zone: 'Andhra Pradesh',
            state: 'Andhra Pradesh',
            isActive: true
          }
        },
        'rbh': {
          password: 'rbh',
          user: {
            id: 'user-005',
            employeeCode: 'EMP005',
            name: 'Amit Patel',
            role: 'RBH',
            email: 'rbh@example.com',
            phone: '+91 98765 43214',
            region: 'Delhi NCR',
            zone: 'North Zone',
            state: 'Delhi',
            isActive: true
          }
        },
        'rbh_ap': {
          password: 'rbh_ap',
          user: {
            id: 'user-006',
            employeeCode: 'EMP006',
            name: 'Ramesh Babu',
            role: 'RBH',
            email: 'rbh_ap@example.com',
            phone: '+91 98765 43215',
            region: 'Rayalaseema',
            zone: 'Andhra Pradesh',
            state: 'Andhra Pradesh',
            isActive: true
          }
        },
        'zbh': {
          password: 'zbh',
          user: {
            id: 'user-007',
            employeeCode: 'EMP007',
            name: 'Vikram Singh',
            role: 'ZBH',
            email: 'zbh@example.com',
            phone: '+91 98765 43216',
            zone: 'North Zone',
            isActive: true
          }
        },
        'zbh_ap': {
          password: 'zbh_ap',
          user: {
            id: 'user-008',
            employeeCode: 'EMP008',
            name: 'Srinivas Rao',
            role: 'ZBH',
            email: 'zbh_ap@example.com',
            phone: '+91 98765 43217',
            zone: 'Andhra Pradesh',
            state: 'Andhra Pradesh',
            isActive: true
          }
        },
        'rmm': {
          password: 'rmm',
          user: {
            id: 'user-009',
            employeeCode: 'EMP009',
            name: 'Sunita Gupta',
            role: 'RMM',
            email: 'rmm@example.com',
            phone: '+91 98765 43218',
            isActive: true
          }
        },
        'mh': {
          password: 'mh',
          user: {
            id: 'user-010',
            employeeCode: 'EMP010',
            name: 'Asad Ahmed',
            role: 'MH',
            email: 'mh@example.com',
            phone: '+91 98765 43219',
            isActive: true
          }
        },
        'vp': {
          password: 'vp',
          user: {
            id: 'user-011',
            employeeCode: 'EMP011',
            name: 'Navdeep Mehta',
            role: 'VP',
            email: 'vp@example.com',
            phone: '+91 98765 43220',
            isActive: true
          }
        },
        'md': {
          password: 'md',
          user: {
            id: 'user-012',
            employeeCode: 'EMP012',
            name: 'Ravi Agarwal',
            role: 'MD',
            email: 'md@example.com',
            phone: '+91 98765 43221',
            isActive: true
          }
        },
        'sfaadmin': {
          password: 'sfaadmin',
          user: {
            id: 'sfaadmin',
            employeeCode: 'ADMIN001',
            name: 'SFA Administrator',
            role: 'sfaadmin',
            email: 'sfaadmin@gencrest.com',
            phone: '+91 98765 00000',
            territory: 'All India',
            region: 'All Regions',
            zone: 'All Zones',
            state: 'All States',
            isActive: true,
            user_metadata: {
              role: 'sfaadmin',
              is_admin: true,
              is_super_admin: true
            }
          }
        },
        'cfo': {
          password: 'cfo',
          user: {
            id: 'user-013',
            employeeCode: 'EMP013',
            name: 'Ashok Bansal',
            role: 'CFO',
            email: 'cfo@example.com',
            phone: '+91 98765 43222',
            isActive: true
          }
        },
        'chro': {
          password: 'chro',
          user: {
            id: 'user-014',
            employeeCode: 'EMP014',
            name: 'Meera Joshi',
            role: 'CHRO',
            email: 'chro@example.com',
            phone: '+91 98765 43223',
            isActive: true
          }
        },
        'admin': {
          password: 'admin',
          user: {
            id: 'user-admin',
            employeeCode: 'ADMIN001',
            name: 'effyBiz Admin',
            role: 'ADMIN',
            email: 'admin@example.com',
            phone: '+91 98765 43224',
            isActive: true
          }
        }
      };

      const mockUser = mockUsers[username];
      if (mockUser && mockUser.password === password) {
        setUser(mockUser.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('authUser', JSON.stringify(mockUser.user));
        return true;
      }

      console.error('Invalid credentials');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call the backend logout endpoint to invalidate the refreshToken
      await fetchWithAuth('/api/auth/logout', {
        method: 'POST',
        // It will send the token, and the refresh cookie
      });
    } catch (error) {
      console.error("Logout API call failed, logging out locally anyway:", error);
    } finally {
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;

    const roleData = getRoleByCode(user.role);
    if (!roleData) return false;

    // Check if user has permission for this module and action
    const modulePermission = roleData.permissions.find(p => p.module === module || p.module === 'all');
    return modulePermission?.actions.includes(action as any) || false;
  };

  const canApprove = (submitterRole: string): boolean => {
    if (!user) return false;

    const roleData = getRoleByCode(user.role);
    return roleData?.canApprove.includes(submitterRole) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      hasPermission,
      canApprove
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};