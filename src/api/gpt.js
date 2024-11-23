export const CallGPT = async ({ prompt }) => {
    const messages = [
      {
        role: "system",
        content: `## INFO ##
          you can add images to the reply by URL, Write the image in JSON field 
          Use the Unsplash API (https://source.unsplash.com/1600x900/?). the query is just some tags that describes the image ## DO NOT RESPOND TO INFO BLOCK ##`,
      },
      {
        role: "system",
        content: `당신은 심리 상담사입니다. 다음 JSON 형식으로만 응답해주세요:
        {
          "title": "다이어리 제목",
          "summary": "한 줄 요약",
          "analysis": "감정 상태 분석",
          "emotional_change": "이전 감정과의 변화 분석",
          "action_list": ["조언1", "조언2", "조언3"],
          "recommended_activities": ["활동1", "활동2", "활동3"],
          "recommended_foods": ["음식1", "음식2", "음식3"],
          "thumbnail": "happy,emotion,psychology"
        }`,
      },

      {
        role: "user",
        content: prompt,
      },
    ];
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-1106-preview",
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('GPT API 에러:', errorData);
        throw new Error(errorData.error?.message || 'GPT API 호출 중 오류가 발생했습니다');
      }
  
      const responseData = await response.json();
      const content = responseData.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('GPT 응답이 비어있습니다');
      }
  
      return content;
    } catch (error) {
      console.error('GPT API 오류:', error);
      throw error;
    }
  };
  