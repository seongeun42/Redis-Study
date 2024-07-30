import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import redis from 'redis';
import RedisStore from "connect-redis"

// .env 파일 로드
dotenv.config();

const app = express();

// Redis 클라이언트 설정
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  legacyMode: false,
});

redisClient.on('connect', () => {
  console.info('Redis connected!');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Redis 클라이언트 연결
await redisClient.connect();

// 쿠키 파서 미들웨어 설정
app.use(cookieParser(process.env.COOKIE_SECRET));

// 세션 미들웨어 설정
const sessionOptions = {
  store: new RedisStore({ client: redisClient, prefix: 'session:' }), // 세션 데이터를 로컬 서버 메모리가 아닌 redis db에 저장하도록 등록
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,  // 클라이언트 측에서 쿠키에 접근하지 못하도록 함
    secure: false,   // HTTPS가 아닌 경우에는 false로 설정 (HTTPS를 사용할 경우 true로 설정)
    maxAge: 60000    // 쿠키의 유효기간 (밀리초 단위로 1분)
  }
};

app.use(session(sessionOptions));

// 라우트 설정
app.get('/', (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.send(`<p>Number of views: ${req.session.views}</p>`);
  } else {
    req.session.views = 1;
    res.send('Welcome to the session demo. Refresh page!');
  }
});

// 서버 시작
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
