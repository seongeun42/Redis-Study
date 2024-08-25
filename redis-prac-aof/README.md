## Docker Redis Snapshot 실습

1. 스냅샷 설정하기

   #### redis.conf

   ```
   bind 0.0.0.0
   port 6379
   requirepass test1234
   appendonly yes
   appendfilename "aof_test.aof"
   appendfsync everysec
   dir /data
   ```

   - `appendonly` : AOF 기능 활성화
   - `appendfilename` : aof 파일명 설정
   - `appendfsync` : 생성 시점 설정
     - `always` : 쓰기 작업마다 (성능 안 좋음)
     - `everysec` : 매초마다
     - `no` : 운영체제가 설정한 시점
   - `dir` : rdb/aof 저장 경로

<br>
<br>

2. Redis 컨테이너 띄우기

   ```
   docker run -d --name redis \n
   -v {설정 파일 경로}\redis.conf:/usr/local/etc/redis/redis.conf \n
   -v {data 저장 경로}:/data redis:latest \n
   redis-server /usr/local/etc/redis/redis.conf
   ```

<br>
<br>

3. Redis 백업 확인

   ```
   docker exec -it redis redis-cli
   ```
