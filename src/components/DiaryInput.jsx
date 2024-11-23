import { Input, Button, message } from "antd";
import { useState } from "react";
import { Title } from "./CommonStyles";
import styled from "styled-components";
import { FileImageOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import { useAuth } from '../contexts/AuthContext';

const { TextArea } = Input;

const DiaryInput = ({ isLoading, onSubmit, messageApi }) => {
  const { user } = useAuth();
  const [userInput, setUserInput] = useState("");
  // 사용자의 입력을 받아, 상위컴포넌트로 데이터를 전달

  // loading 상태 - 사용자가 제출버튼을 못 누르도록 처리
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };
  
  const handleClick = () => {
    if (!user) {
      messageApi.open({
        type: "error",
        content: "로그인이 필요한 서비스입니다.",
      });
      return;
    }

    if (!userInput) {
      messageApi.open({
        type: "error",
        content: "일과를 적어주세요.",
      });
      return;
    }
    
    messageApi.open({
      type: "success",
      content: "생성 요청 완료",
    });

    onSubmit(userInput);
    setUserInput("");
  };

  const captureAndDownload = async () => {
    const nodeToCapture = document.getElementById("capture");
    
    try {
      const canvas = await html2canvas(nodeToCapture, {
        allowTaint: true,
        useCORS: true,
        logging: true,
        imageTimeout: 0,
        onclone: function(clonedDoc) {
          const images = clonedDoc.getElementsByTagName('img');
          for(let img of images) {
            img.crossOrigin = "anonymous";
          }
        }
      });

      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.download = "gpt-diary-result.png";
      a.click();
    } catch (error) {
      console.error('캡처 중 오류 발생:', error);
      messageApi.error('이미지 캡처에 실패했습니다.');
    }
  };



  return (
    <div>
      <Title>오늘의 감정;</Title>
      <TextArea
        value={userInput}
        onChange={handleUserInput}
        placeholder="오늘 일어난 일들과 감정을 간단히 적어주세요."
        style={{ height: "200px" }}
      />
      <ButtonContainer>
        <Button loading={isLoading} onClick={handleClick}>
          감정 분석 시작
        </Button>
        <Button
          icon={<FileImageOutlined />}
          loading={isLoading}
          onClick={captureAndDownload}
        >
          캡처
        </Button>
      </ButtonContainer>
      <canvas id="canvas" style={{ display: "none" }}></canvas>
    </div>
  );
};

export default DiaryInput;

const ButtonContainer = styled.div`
  margin: 20px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: 5px;
`;
