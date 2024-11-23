import {
  DiaryContainer,
  ResultTitle,
  Divider,
  CardContainer,
  CardTitle,
  CardContent,
  ActionListItem,
} from "./CommonStyles";

import {
  LoadingOutlined,
  CheckCircleTwoTone,
  HeartTwoTone,
  SmileTwoTone,
  MessageTwoTone,
  SoundTwoTone,
} from "@ant-design/icons";

import { Image } from "antd";
import styled from "styled-components";
import { useState, useEffect } from 'react';

const ThumbnailImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin: 16px 0;
`;

const DiaryDisplay = ({ data, prevData, isLoading }) => {
  const [imageUrl, setImageUrl] = useState("");
  
  useEffect(() => {
    if (data?.thumbnail) {
      // 키워드를 URL에 적용
      setImageUrl(`https://source.unsplash.com/1600x900/?${encodeURIComponent(data.thumbnail)}`);
    }
  }, [data?.thumbnail]);

  if (!data || typeof data !== 'object') return null;
  
  // 필수 필드 검증
  const requiredFields = ['title', 'summary', 'analysis', 'recommended_foods'];
  const hasAllFields = requiredFields.every(field => data[field]);
  
  if (!hasAllFields) {
    console.error('필수 필드가 누락되었습니다:', data);
    return null;
  }

  return (
    <DiaryContainer>
      {isLoading && (
        <>
          불러오는중...
          <LoadingOutlined />
        </>
      )}
      <ResultTitle>{data.title}</ResultTitle>

      <Divider />
      <CardContainer>
        <CardTitle>
          <CheckCircleTwoTone
            twoToneColor="#FF9AA2"
            style={{ marginRight: "6px" }}
          />
          요약
        </CardTitle>
        <CardContent>{data.summary}</CardContent>
      </CardContainer>

      {imageUrl && (
        <ThumbnailImage 
          src={imageUrl} 
          alt="감정 이미지"
          onError={(e) => {
            console.error('이미지 로드 실패:', e);
            setImageUrl(""); // 이미지 로드 실패시 이미지 숨김
          }}
        />
      )}

      <Divider />
      <CardContainer>
        <CardTitle>
          <MessageTwoTone
            twoToneColor={"#B5EAD7"}
            style={{ marginRight: "6px" }}
          />
          심리 분석
        </CardTitle>
        <CardContent>{data.analysis}</CardContent>
      </CardContainer>

      {data.action_list && data.action_list.length > 0 && (
        <>
          <Divider />
          <CardContainer>
            <CardTitle>
              <SoundTwoTone twoToneColor="#C7CEEA" style={{ marginRight: "6px" }} />
              GPT 조언
            </CardTitle>
            <CardContent>
              {data.action_list.map((action, index) => (
                <ActionListItem key={index}>{action}</ActionListItem>
              ))}
            </CardContent>
          </CardContainer>
        </>
      )}

      {data.recommended_activities && data.recommended_activities.length > 0 && (
        <>
          <Divider />
          <CardContainer>
            <CardTitle>
              <SmileTwoTone twoToneColor="#FFDAC1" style={{ marginRight: "6px" }} />
              맞춤 활동 추천
            </CardTitle>
            <CardContent>
              {data.recommended_activities.map((activity, index) => (
                <ActionListItem key={index}>{activity}</ActionListItem>
              ))}
            </CardContent>
          </CardContainer>
        </>
      )}

      {data.recommended_foods && data.recommended_foods.length > 0 && (
        <>
          <Divider />
          <CardContainer>
            <CardTitle>
              <HeartTwoTone twoToneColor="#FFB7B2" style={{ marginRight: "6px" }} />
              맞춤 요리 추천
            </CardTitle>
            <CardContent>
              {data.recommended_foods.map((food, index) => (
                <ActionListItem key={index}>{food}</ActionListItem>
              ))}
            </CardContent>
          </CardContainer>
        </>
      )}

      {prevData && (
        <>
          <Divider />
          <CardContainer>
            <CardTitle>
              <HeartTwoTone twoToneColor="#FFB7B2" style={{ marginRight: "6px" }} />
              감정 변화 분석
            </CardTitle>
            <CardContent>
              <EmotionalChangeAnalysis 
                currentData={data} 
                prevData={prevData} 
              />
            </CardContent>
          </CardContainer>
        </>
      )}
    </DiaryContainer>
  );
};

const EmotionalChangeAnalysis = ({ currentData, prevData }) => {
  if (!currentData.emotional_change) {
    return (
      <div>
        이전 상태: {prevData.summary}
        현재 상태: {currentData.summary}
        
        변화 분석: 
        {currentData.analysis}
      </div>
    );
  }

  return <div>{currentData.emotional_change}</div>;
};

export default DiaryDisplay;
