import styled from 'styled-components';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Card, Empty } from 'antd';
import { formatDate } from '../utils/dateFormat';

const DiaryHistory = ({ user }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDiaryHistory();
    }
  }, [user]);

  const fetchDiaryHistory = async () => {
    try {
      const response = await axios.get('/diary/history');
      setHistory(response.data);
    } catch (error) {
      console.error('다이어리 히스토리 조회 실패:', error);
    }
  };

  if (!user) return null;

  return (
    <HistoryContainer>
      <HistoryTitle>감정 분석 기록</HistoryTitle>
      {history.length === 0 ? (
        <Empty description="기록된 감정 분석이 없습니다" />
      ) : (
        history.map((entry) => (
          <HistoryCard key={entry.id}>
            <HistoryDate>{formatDate(entry.created_at)}</HistoryDate>
            <HistoryContent>
              <div><strong>제목:</strong> {entry.result_json.title}</div>
              <div><strong>요약:</strong> {entry.result_json.summary}</div>
            </HistoryContent>
          </HistoryCard>
        ))
      )}
    </HistoryContainer>
  );
};

export default DiaryHistory;

const HistoryContainer = styled.div`
  width: 300px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  height: calc(100vh - 140px);
  overflow-y: auto;
  position: sticky;
  top: 20px;
  left: 0;
  margin-left: 0;
`;

const HistoryTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const HistoryCard = styled(Card)`
  margin-bottom: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HistoryDate = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const HistoryContent = styled.div`
  font-size: 14px;
  line-height: 1.5;
`;