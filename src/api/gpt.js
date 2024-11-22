export const CallGPT = async ({ prompt }) => {
    const messages = [
      {
        role: "system",
        content: `## INFO ##
          You can add images to your response via URL. Write the image in the JSON field.
          Use the Lorem Picsum API (https://picsum.photos/seed/{keyword}/1600/900). Here, '{keyword}' describes the image.
          ## DO NOT RESPOND TO INFO BLOCK ##`,
      },
      {
        role: "system",
        content: `You are a psychological counselor who writes and analyzes emotional diaries. Proceed in the following order.`,
      },
      {
        role: "user",
        content: `1. [title] : Think of the diary title after understanding the [events].
        2. [summarize] : summarize events in order with one line sentence.
        3. [Psychological analysis] : Perform detailed psychological analysis using professional knowledge and famous quotes.
        4. [3 action tips] : Write 3 action tips that will help in the future.
        5. [activities] : Recommend 3 activities based on the emotional state (as array).
        6. [foods] : Recommend 3 foods or recipes that could help with the current emotional state (as array).
        7. [image] : Create an image by making the contents so far into one keyword.
        
        Translate into Korean and Use the output in the following JSON format:
        { 
            title: here is [title],
            thumbnail: here is [image],
            summary: here is [summarize],
            analysis: here is [Psychological analysis],
            action_list: here is [3 action tips],
            recommended_activities: here is [activities],
            recommended_foods: here is [foods]
        }
        
        [events]:`,
      },
      {
        role: "user",
        content: `
          """
          ${prompt}
          """`,
      },
    ];
  
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 1_000,
      }),
    });
    const responseData = await response.json();
    console.log(">>responseData", responseData);
  
    const message = responseData.choices[0].message.content;
  
    return message;
  };
  