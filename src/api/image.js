import axios from './axios';

export const generateImage = async (prompt) => {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Generate an abstract image that represents the following emotion or mood: ${prompt}`,
        n: 1,
        size: "1024x1024"
      })
    });

    if (!response.ok) {
      throw new Error('이미지 생성에 실패했습니다');
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    throw error;
  }
}; 