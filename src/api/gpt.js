import axios from './axios';

export const CallGPT = async ({ prompt }) => {
  try {
    const response = await axios.post('/gpt/chat', { prompt });
    const result = response.data.result;

    try {
      return JSON.parse(result);
    } catch (parseError) {
      console.error('JSON 파싱 에러:', parseError);
      throw new Error('응답 데이터 형식이 올바르지 않습니다');
    }
  } catch (error) {
    console.error('GPT API 에러:', error);
    throw error;
  }
};
  