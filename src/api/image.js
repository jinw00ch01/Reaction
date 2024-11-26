import axios from './axios';

export const generateImage = async (prompt) => {
  try {
    const response = await axios.post('/image/generate', {
      prompt: prompt
    }, {
      timeout: 30000,
      responseType: 'arraybuffer'
    });
    
    if (response.data) {
      const blob = new Blob([response.data], { type: 'image/png' });
      return URL.createObjectURL(blob);
    }
    
    throw new Error('이미지 데이터를 받지 못했습니다');
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    const keywords = encodeURIComponent(prompt.split(' ').slice(0, 3).join(','));
    return `https://source.unsplash.com/1024x1024/?${keywords}`;
  }
}; 