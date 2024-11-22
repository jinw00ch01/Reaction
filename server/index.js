const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./config/database');
const { authenticateToken } = require('./middleware/auth');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',  // 프론트엔드 서버 주소로 변경
    credentials: true
  }));
app.use(express.json());

// 기본 라우트 추가
app.get('/', (req, res) => {
  res.json({ message: 'API 서버가 정상적으로 실행중입니다.' });
});

// API 라우트들
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    res.status(201).json({ 
      message: '회원가입이 완료되었습니다',
      userId: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다' });
    }
    console.error('회원가입 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '존재하지 않는 계정입니다' });
    }

    const user = users[0];
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
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('토큰 검증 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행중입니다`);
}); 