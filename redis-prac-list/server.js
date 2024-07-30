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

app.post('/message', async (req, res) => {
    const { username, message } = req.body;
    const newMessage = { username, message, timestamp: new Date().toISOString() };
    await redisClient.lPush('messages', JSON.stringify(newMessage));
    res.json(newMessage);
});

app.get('/message', async (req, res) => {
    const messages = await redisClient.v4.lRange('messages', 0, 9);
    const parsedMessages = messages.map(msg => JSON.parse(msg));
    res.json(parsedMessages);
});

// 서버 시작
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
