const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./config/database.js');
const { authenticateToken } = require('./middleware/auth.js');
require('dotenv').config();
const axios = require('axios');
const { promisify } = require('util');
const sqlite3 = require('sqlite3');

// OpenAI 설정
const OpenAI = require('openai');

const app = express();

// 데이터베이스 초기화
require('./database/init.js');

// CORS 설정
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// OpenAI 인스턴스 생성 방식 변경
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'API 서버가 정상적으로 실행중입니다.' });
});

// 인증 관련 라우트
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: '이미 존재하는 이메일입니다' });
          }
          console.error('회원가입 에러:', err);
          return res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
        res.status(201).json({ 
          message: '회원가입이 완료되었습니다',
          userId: this.lastID
        });
      }
    );
  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          console.error('데이터베이스 조회 에러:', err);
          return res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }

        if (!user) {
          return res.status(404).json({ message: '존재하지 않는 계정입다' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
          return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' });
        }

        const token = jwt.sign(
          { userId: user.id }, 
          process.env.JWT_SECRET, 
          { expiresIn: '1h' }
        );
        
        const refreshToken = jwt.sign(
          { userId: user.id }, 
          process.env.JWT_REFRESH_SECRET, 
          { expiresIn: '7d' }
        );

        res.json({
          token,
          refreshToken,
          user: { id: user.id, email: user.email }
        });
      }
    );
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: '리프레시 토큰이 필요합니다' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const token = jwt.sign(
      { userId: decoded.userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('토큰 갱신 에러:', error);
    res.status(403).json({ message: '유효하지 않은 리프레시 토큰입니다' });
  }
});

// 프로미스 형태로 db.run을 사용하는 헬퍼 함수 생성
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

app.delete('/auth/withdraw', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    // 트랜잭션 시작
    await runAsync('BEGIN TRANSACTION');

    // 사용자의 다이어리 데이터 삭제
    await runAsync('DELETE FROM diaries WHERE user_id = ?', [userId]);

    // 사용자 계정 삭제
    await runAsync('DELETE FROM users WHERE id = ?', [userId]);

    // 트랜잭션 커밋
    await runAsync('COMMIT');
    res.json({ message: '회원탈퇴가 완료되었습니다' });
  } catch (error) {
    // 에러 발생 시 롤백
    await runAsync('ROLLBACK');
    console.error('회원탈퇴 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

// 다이어리 관��� 라우트
app.post('/diary', authenticateToken, async (req, res) => {
  const { input, result } = req.body;
  const userId = req.user.userId;
  
  try {
    db.run(
      'INSERT INTO diaries (user_id, input_text, result_json, created_at) VALUES (?, ?, ?, datetime("now", "localtime"))',
      [userId, input, JSON.stringify(result)],
      function(err) {
        if (err) {
          console.error('다이어리 저장 에러:', err);
          return res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
        
        res.status(201).json({ 
          message: '다이어리가 저장되었습니다',
          diaryId: this.lastID 
        });
      }
    );
  } catch (error) {
    console.error('다이어리 저장 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

app.get('/diary/recent', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  db.all(
    'SELECT * FROM diaries WHERE user_id = ? ORDER BY created_at DESC LIMIT 2',
    [userId],
    (err, diaries) => {
      if (err) {
        console.error('다이어리 조회 에러:', err);
        return res.status(500).json({ message: '서버 오류가 발생했습니다' });
      }
      res.json(diaries);
    }
  );
});

app.get('/diary/history', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  db.all(
    'SELECT id, input_text, result_json, created_at FROM diaries WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, diaries) => {
      if (err) {
        console.error('다이어리 히스토리 조회 에러:', err);
        return res.status(500).json({ message: '서버 오류가 발생했습니다' });
      }
      
      const formattedDiaries = diaries.map(diary => ({
        ...diary,
        result_json: JSON.parse(diary.result_json)
      }));
      
      res.json(formattedDiaries);
    }
  );
});

// 이미지 생성 엔드포인트 수정
app.post('/image/generate', authenticateToken, async (req, res) => {
  const { prompt } = req.body;
  
  try {
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    if (!response.data?.[0]?.url) {
      throw new Error('이미지 URL을 받지 못했습니다');
    }

    // DALL-E 이미지를 서버에서 가져와서 클라이언트로 전달
    const imageResponse = await axios.get(response.data[0].url, {
      responseType: 'arraybuffer'
    });
    
    res.set('Content-Type', 'image/png');
    res.send(imageResponse.data);
  } catch (error) {
    console.error('OpenAI 이미지 생성 에러:', error);
    const keywords = encodeURIComponent(prompt.split(' ').slice(0, 3).join(','));
    res.json({ 
      imageUrl: `https://source.unsplash.com/1024x1024/?${keywords}`,
      fallback: true 
    });
  }
});

// 토큰 검증 엔드포인트 수정
app.get('/auth/verify', authenticateToken, async (req, res) => {
  try {
    db.get(
      'SELECT id, email FROM users WHERE id = ?',
      [req.user.userId],
      (err, user) => {
        if (err) {
          console.error('사용자 조회 에러:', err);
          return res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }

        if (!user) {
          return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
        }

        res.json({ user: { id: user.id, email: user.email } });
      }
    );
  } catch (error) {
    console.error('사용자 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

app.post('/gpt/chat', authenticateToken, async (req, res) => {
  const { prompt } = req.body;
  try {
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
}
`
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('GPT API 호출 중 오류가 발생했습니다');
    }

    const result = response.choices[0].message.content;

    res.json({ result });
  } catch (error) {
    console.error('GPT API 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행중입니다`);
}); 