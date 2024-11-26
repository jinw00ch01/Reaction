const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Received token:', token);

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('토큰 검증 실패:', err);
      return res.status(403).json({ message: '유효하지 않은 토큰입니다' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken }; 