import { useState } from "react";
import { CallGPT } from "./api/gpt";
import DiaryInput from "./components/DiaryInput";
import styled from "styled-components";
import logo from "./assets/logo.png";
import DiaryDisplay from "./components/DiaryDisplay";
import { message } from "antd";
import AuthButtons from './components/AuthButtons';

const dummyData = JSON.parse(
  `{ 
    "title": "개발 고민과 해결", 
    "thumbnail": "https://picsum.photos/seed/coding/1600/900", 
    "summary": "코딩 강의를 듣고 프로젝트에 버그가 발생했지만 해결하지 못하여 GPT를 통해 문제를 해결했음", 
    "analysis": "이번 상황은 개발자로서 성장하는 과정에서 마주치는 자연스러운 도전이었습니다. 알고리즘과 문제 해결 능력은 중요하지만, 개념적인 이해와 전체적인 시스템 구조 파악이 더 중요하다는 것을 알 수 있었습니다. 아인슈타인의 '문제가 발생한 사고방식으로는 그 문제를 해결할 수 없다'는 말처럼, 단순히 문제 해결에만 집중하기보다는 근본적인 이해를 통한 접근이 필요합니다.", 
    "action_list": [
      "더 깊은 개념적 이해를 위해 관련 서적을 읽어보기", 
      "다른 개발자들과 소통하여 문제 해결 방법 나누기", 
      "개발자 커뮤니티에 참여하여 지식을 공유하기"
    ],
    "recommended_activities": [
      "15분 명상으로 마음 진정시키기",
      "가벼운 산책으로 머리 식히기",
      "코딩과 관련없는 취미 활동하기"
    ],
    "recommended_foods": [
      "집중력 향상을 위한 견과류와 블루베리",
      "스트레스 해소에 좋은 다크 초콜릿",
      "뇌 활동에 도움되는 연어 요리"
    ]
  }`
);

function App() {
  const [data, setData] = useState(dummyData);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleClickAPICall = async (userInput) => {
    try {
      setIsLoading(true);
      const message = await CallGPT({
        prompt: `${userInput}`,
      });
      setData(JSON.parse(message));
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error?.message,
      });
      return;
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
        <DiaryDisplay isLoading={isLoading} data={data} />
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
