export const CallGPT = async ({ prompt }) => {
    const messages = [
      {
        role: "system",
        content: `당신은 공감적이고 전문적인 심리 상담사입니다. 내담자의 이야기를 경청하고 깊이 있는 심리 분석과 치유적 조언을 제공해주세요. 응답은 반드시 올바른 JSON 형식이어야 합니다.`,
      },
      {
        role: "system",
        content: `다음 JSON 형식으로만 응답하세요:
{
  "title": "감정 키워드를 포함한 제목",
  "summary": "현재 감정 상태 요약",
  "analysis": "전문적인 심리 분석",
  "emotional_change": "감정 변화 분석",
  "action_list": ["조언1", "조언2", "조언3"],
  "recommended_activities": ["활동1", "활동2", "활동3"],
  "recommended_foods": ["음식1", "음식2", "음식3"],
  "thumbnail": "emotion,psychology,healing"
}`
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
          max_tokens: 2000,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error('GPT API 호출 중 오류가 발생했습니다');
      }

      const data = await response.json();
      const result = data.choices[0].message.content;
      
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
  