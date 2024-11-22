import axios, { API_ENDPOINTS } from './axios';

export class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.auth.login, {
        email,
        password,
      });
      
      const { token, refreshToken, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return { user };
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다', 'INVALID_CREDENTIALS');
          case 404:
            throw new AuthError('존재하지 않는 계정입니다', 'USER_NOT_FOUND');
          default:
            throw new AuthError('로그인 중 오류가 발생했습니다', 'UNKNOWN_ERROR');
        }
      }
      throw new AuthError('서버와 통신할 수 없습니다', 'NETWORK_ERROR');
    }
  },

  signup: async (email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.auth.signup, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 409:
            throw new AuthError('이미 존재하는 이메일입니다', 'EMAIL_EXISTS');
          case 400:
            throw new AuthError('잘못된 입력입니다', 'INVALID_INPUT');
          default:
            throw new AuthError('회원가입 중 오류가 발생했습니다', 'UNKNOWN_ERROR');
        }
      }
      throw new AuthError('서버와 통신할 수 없습니다', 'NETWORK_ERROR');
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post(API_ENDPOINTS.auth.refresh, { refreshToken });
      const { token } = response.data;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw new AuthError('인증이 만료되었습니다. 다시 로그인해주세요.', 'TOKEN_EXPIRED');
    }
  },

  verifyToken: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.auth.verify);
      return response.data;
    } catch (error) {
      throw new AuthError('토큰 검증에 실패했습니다', 'TOKEN_VERIFICATION_FAILED');
    }
  },

  logout: async () => {
    try {
      await axios.post(API_ENDPOINTS.auth.logout);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      // 로그아웃 실패 시에도 로컬 스토리지는 클리어
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw new AuthError('로그아웃 중 오류가 발생했습니다', 'LOGOUT_ERROR');
    }
  },

  withdraw: async () => {
    try {
      await axios.delete(API_ENDPOINTS.auth.withdraw);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      if (error.response) {
        throw new AuthError('회원탈퇴 처리 중 오류가 발생했습니다', 'WITHDRAW_ERROR');
      }
      throw new AuthError('서버와 통신할 수 없습니다', 'NETWORK_ERROR');
    }
  }
}; 