import { useState, useEffect } from "react";
import { CallGPT } from "./api/gpt";
import DiaryInput from "./components/DiaryInput";
import styled from "styled-components";
import DiaryDisplay from "./components/DiaryDisplay";
import { message } from "antd";
import AuthButtons from './components/AuthButtons';
import axios from './api/axios';
import { useAuth } from './contexts/AuthContext';
import DiaryHistory from './components/DiaryHistory';
import questioncat from "./assets/questioncat.gif";
import popcat from "./assets/popcat.gif";

function App() {
  const [data, setData] = useState(null);
  const [prevData, setPrevData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuth();
  const [diaryUpdated, setDiaryUpdated] = useState(0);

  useEffect(() => {
    if (!user) {
      setData(null);
      setPrevData(null);
    }
  }, [user]);

  const fetchRecentDiary = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get('/diary/recent');
      if (response.data.length > 1) {
        setPrevData(JSON.parse(response.data[1].result_json));
      }
    } catch (error) {
      console.error('최근 다이어리 조회 실패:', error);
    }
  };

  const handleClickAPICall = async (userInput) => {
    try {
      setIsLoading(true);
      let gptPrompt = `${userInput}`;
      
      if (user && prevData) {
        gptPrompt += `\n\n이전 감정 상태:\n${prevData.summary}\n\n이전 분석:\n${prevData.analysis}`;
      }
  
      const result = await CallGPT({
        prompt: gptPrompt,
      });
      
      if (!result || typeof result !== 'object') {
        throw new Error('응답 데이터가 올바르지 않습니다');
      }
  
      setData(result);
  
      if (user) {
        await axios.post('/diary', {
          input: userInput,
          result: result
        });
        await fetchRecentDiary();

        setDiaryUpdated(diaryUpdated + 1);
      }
    } catch (error) {
      console.error('API 호출 에러:', error);
      messageApi.open({
        type: "error",
        content: error?.message || '오류가 발생했습니다',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (userInput) => {
    handleClickAPICall(userInput);
  };

  return (
    <AppContainer>
      {contextHolder}
      <AuthButtons />
      <AppTitle>
        <TitleText>심리상담사 AI, Reaction</TitleText>
        <LogoImage 
          src={user ? popcat : questioncat} 
          alt="logo" 
        />
      </AppTitle>
      <ContentContainer>
        <DiaryHistory user={user} diaryUpdated={diaryUpdated} />
        <MainContent>
          <DiaryInput
            messageApi={messageApi}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
          <div id="capture">
            <DiaryDisplay 
              isLoading={isLoading} 
              data={data} 
              prevData={user ? prevData : null} 
            />
          </div>
        </MainContent>
      </ContentContainer>
    </AppContainer>
  );
}

export default App;

const AppContainer = styled.div`
  padding: 20px;
  width: 100%;
  min-height: 100vh;
  position: relative;
`;

const AppTitle = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 10px;
  background: linear-gradient(to right, #fafafa, #f0f0f0);
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TitleText = styled.span`
  font-family: 'Noto Serif KR', serif;
  font-size: 38px;
  font-weight: 500;
  color: #333;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
`;

const LogoImage = styled.img`
  height: 60px;
  width: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ContentContainer = styled.div`
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 40px;
  padding-top: 20px;
`;

const MainContent = styled.div`
  width: 800px;
  margin: 0 auto;
  flex-grow: 1;
`;
