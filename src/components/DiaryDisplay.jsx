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
import { generateImage } from '../api/image';

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
    if (data?.summary) {
      generateImage(data.summary)
        .then(url => setImageUrl(url))
        .catch(error => {
          console.error('이미지 생성 실패:', error);
          setImageUrl("");
        });
    }
  }, [data?.summary]);

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
        <div style={{ margin: '20px 0' }}>
          <img 
            src={imageUrl}
            alt="감정 이미지"
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            onError={(e) => {
              console.error('이미지 로드 실패:', e);
              // 이미지 로드 실패시 재시도
              const newTimestamp = new Date().getTime();
              setImageUrl(`https://source.unsplash.com/1600x900/?${encodeURIComponent(data.thumbnail)}&t=${newTimestamp}`);
            }}
          />
        </div>
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
  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ marginBottom: '15px' }}>
          <strong>이전 상태:</strong> 
          <p style={{ margin: '8px 0' }}>{prevData.summary}</p>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>현재 상태:</strong>
          <p style={{ margin: '8px 0' }}>{currentData.summary}</p>
        </div>
      </div>
      
      <div>
        <strong>변화 분석:</strong>
        <p style={{ margin: '8px 0' }}>
          {currentData.emotional_change || 
           `${prevData.summary}에서 ${currentData.summary}로의 감정 변화가 관찰됩니다. ${currentData.analysis}`}
        </p>
      </div>
    </div>
  );
};

export default DiaryDisplay;
