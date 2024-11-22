import { Button } from 'antd';
import styled from 'styled-components';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const AuthButtons = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isSignupVisible, setIsSignupVisible] = useState(false);
  const { user, logout } = useAuth();

  return (
    <ButtonsContainer>
      {user ? (
        <>
          <UserEmail>{user.email}</UserEmail>
          <Button onClick={logout}>로그아웃</Button>
        </>
      ) : (
        <>
          <Button onClick={() => setIsLoginVisible(true)}>로그인</Button>
          <Button type="primary" onClick={() => setIsSignupVisible(true)}>
            회원가입
          </Button>
        </>
      )}
      
      <LoginModal 
        visible={isLoginVisible} 
        onClose={() => setIsLoginVisible(false)} 
      />
      <SignupModal 
        visible={isSignupVisible} 
        onClose={() => setIsSignupVisible(false)} 
      />
    </ButtonsContainer>
  );
};

export default AuthButtons;

const ButtonsContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const UserEmail = styled.span`
  margin-right: 10px;
  font-size: 14px;
`;