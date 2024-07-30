import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';

// .env 파일 로드
dotenv.config();

const app = express();

// Redis 클라이언트 설정
const redisClient = createClient({
  url: process.env.REDIS_URL,
  legacyMode: true,
});

redisClient.on('connect', () => {
  console.info('Redis connected!');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Redis 클라이언트 연결
await redisClient.connect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/vote', async (req, res) => {
    const { username, candidate } = req.body;
    const vote = { username, candidate };
    await redisClient.sAdd(vote.candidate, vote.username);
    res.json(vote);
});

app.get('/vote', async (req, res) => {
    const voteCnt = [];
    for (let i = 1; i <= 4; i++) {
      voteCnt.push({ username: `Candidate ${i}`, cnt: await redisClient.v4.sCard(`Candidate ${i}`)});
    }
    res.json(voteCnt);
});

// 서버 시작
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
