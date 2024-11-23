import { useState } from "react";
import { CallGPT } from "./api/gpt";
import DiaryInput from "./components/DiaryInput";
import styled from "styled-components";
import logo from "./assets/logo.png";
import DiaryDisplay from "./components/DiaryDisplay";
import { message } from "antd";
import AuthButtons from './components/AuthButtons';
import axios from './api/axios';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [data, setData] = useState(null);
  const [prevData, setPrevData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuth();

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
        gptPrompt += `\n\n[이전 감정 상태]
        제목: ${prevData.title}
        요약: ${prevData.summary}
        분석: ${prevData.analysis}
        
        위의 이전 감정 상태와 비교하여 현재의 감정 변화를 분석해주세요.`;
      }
  
      const message = await CallGPT({
        prompt: gptPrompt,
      });
      
      let result;
      try {
        result = typeof message === 'string' ? JSON.parse(message) : message;
      } catch (parseError) {
        console.error('JSON 파싱 에러:', parseError);
        throw new Error('응답 데이터 형식이 올바르지 않습니다');
      }
  
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
      }
    } catch (error) {
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
        심리상담사 AI, Reaction <img width={"100px"} src={logo} alt="logo" />
      </AppTitle>
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
    </AppContainer>
  );
}

export default App;

const AppContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
`;

const AppTitle = styled.div`
  width: 100%;
  font-weight: 400;
  font-size: 35px;
  text-align: center;
  font-family: "Noto Serif KR";
`;
