import { Button, Modal } from 'antd';
import styled from 'styled-components';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const AuthButtons = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isSignupVisible, setIsSignupVisible] = useState(false);
  const { user, logout, withdraw } = useAuth();

  const handleWithdraw = () => {
    Modal.confirm({
      title: '회원탈퇴',
      content: '정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      okText: '탈퇴',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await withdraw();
        } catch (error) {
          // 에러 처리는 AuthContext에서 수행됨
        }
      },
    });
  };

  return (
    <ButtonsContainer>
      {user ? (
        <>
          <UserEmail>{user.email}</UserEmail>
          <Button onClick={logout}>로그아웃</Button>
          <Button danger onClick={handleWithdraw}>회원탈퇴</Button>
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