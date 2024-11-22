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


3.  MySQL Command Line Client 실행
password 입력
인증 후
```
>>  CREATE DATABASE reaction_diary;
>>  USE reaction_diary;

>>    CREATE TABLE users (
>>    id INT AUTO_INCREMENT PRIMARY KEY,
>>    email VARCHAR(255) UNIQUE NOT NULL,
>>    password VARCHAR(255) NOT NULL,
>>    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
>>    );