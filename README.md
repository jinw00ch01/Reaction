# 심리 상담사 AI, Reaction

## 설치 방법

1. 클라이언트 설치

[bash]
npm install

2. 서버 설치

[bash]
cd server
npm install

```

3. **더 효율적인 설치 방법**
루트 디렉토리에 새로운 스크립트를 추가하여 한 번에 모든 의존성을 설치할 수 있습니다. `package.json`을 다음과 같이 수정하세요:


-- sql command
CREATE DATABASE reaction_diary;
USE reaction_diary;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);