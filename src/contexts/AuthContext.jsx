import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, AuthError } from '../api/auth';
import { message } from 'antd';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authAPI.verifyToken();
      setUser(userData);
    } catch (error) {
      if (error instanceof AuthError && error.code === 'TOKEN_EXPIRED') {
        try {
          await authAPI.refreshToken();
          const userData = await authAPI.verifyToken();
          setUser(userData);
        } catch (refreshError) {
          handleAuthError(refreshError);
        }
      } else {
        handleAuthError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error) => {
    if (error instanceof AuthError) {
      switch (error.code) {
        case 'TOKEN_EXPIRED':
        case 'TOKEN_VERIFICATION_FAILED':
          logout();
          message.error('세션이 만료되었습니다. 다시 로그인해주세요.');
          break;
        case 'NETWORK_ERROR':
          message.error('네트워크 연결을 확인해주세요.');
          break;
        default:
          message.error(error.message);
      }
    } else {
      message.error('알 수 없는 오류가 발생했습니다.');
    }
  };

  const login = async (email, password) => {
    try {
      const { user: userData } = await authAPI.login(email, password);
      setUser(userData);
      return true;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      await authAPI.signup(email, password);
      return true;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  const withdraw = async () => {
    try {
      await authAPI.withdraw();
      setUser(null);
      message.success('회원탈퇴가 완료되었습니다');
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      loading,
      checkAuthStatus,
      withdraw
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
