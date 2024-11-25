심리 상담사 AI, Reaction

// 설치 및 실행 방법 //
이 프로젝트는 my-gpt-diary 디렉토리 내에 src와 server 폴더로 구성되어 있습니다. 다음 지침에 따라 애플리케이션을 설정하고 실행하세요.

// 전제 조건 //
Node.js가 설치되어 있어야 합니다. 설치 여부는 다음 명령어로 확인 가능합니다:
 
    node -v

 Node.js가 설치되어 있지 않다면 Node.js 공식 웹사이트에서 최신 버전을 다운로드하여 설치하세요.


1. 프로젝트 압축 해제
이미 프로젝트 폴더가 있는 경우 이 단계는 생략 가능합니다.

    unzip my-gpt-diary.zip

압축을 해제하면 my-gpt-diary 폴더가 생성됩니다.



2. 서버 설정 및 실행
2.1 터미널을 열고 server 디렉토리로 이동합니다:

    cd my-gpt-diary/server

2.2 필요한 패키지를 설치합니다:

    npm install

2.3 OpenAI API 키를 설정합니다:
- server 디렉토리에 .env 파일이 있는지 확인합니다. 없다면 새로 생성합니다.
- .env 파일에 다음 내용을 추가합니다:

     OPENAI_API_KEY=여기에_본인의_OpenAI_API_Key를_입력하세요
     JWT_SECRET=임의의_시크릿_키
     JWT_REFRESH_SECRET=임의의_리프레시_시크릿_키

- OPENAI_API_KEY: 본인의 OpenAI API 키를 입력합니다.
- JWT_SECRET 및 JWT_REFRESH_SECRET: 임의의 문자열을 입력합니다.

2.4 서버를 실행합니다:

    npm start

서버가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다:
   "서버가 3000번 포트에서 실행중입니다"
   "SQLite 데이터베이스에 연결되었습니다."


3. 클라이언트(프론트엔드) 설정 및 실행
3.1 새로운 터미널을 열고 src 디렉토리로 이동합니다:

    cd my-gpt-diary/src

3.2 필요한 패키지를 설치합니다:

    npm install

3.3 환경 변수를 설정합니다:
- src 디렉토리에 .env 파일이 있는지 확인합니다. 없다면 새로 생성합니다.
- .env 파일에 다음 내용을 추가합니다:

     VITE_GPT_API_KEY=여기에_본인의_OpenAI_API_Key를_입력하세요
     VITE_API_URL=http://localhost:3000
     VITE_API_URL_PRODUCTION=http://localhost:3000

3.4 클라이언트를 실행합니다:

    npm run dev

- 실행 후 터미널에 표시된 로컬 개발 서버 주소(예: http://localhost:5173)로 접속합니다.


4. 애플리케이션 사용
웹 브라우저에서 http://localhost:5173에 접속하면 애플리케이션을 사용할 수 있습니다.

- 회원가입을 통해 계정을 생성한 후 로그인하세요.
- 오늘의 감정을 작성하면 AI가 분석하여 결과를 제공합니다.

---

// 요약 //
1. Node.js를 설치합니다.
2. 프로젝트를 압축 해제합니다.
3. 백엔드(server 폴더)에서 패키지를 설치하고 환경 변수를 설정한 후 서버를 실행합니다.
4. 프론트엔드(src 폴더)에서 패키지를 설치하고 환경 변수를 설정한 후 클라이언트를 실행합니다.
5. 웹 브라우저에서 로컬 서버 주소로 접속하여 애플리케이션을 사용합니다.

---
문의 사항
사용 중 문제가 발생하면 해당 프로젝트의 이슈 트래커에 등록하거나 개발자에게 직접 문의해주세요.

