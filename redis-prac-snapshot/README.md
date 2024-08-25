## Docker Redis Snapshot 실습

1. 스냅샷 설정하기

   #### redis.conf

   ```
   bind 0.0.0.0
   port 6379
   requirepass test1234
   dbfilename snapshot_prac.rdb
   dir /data
   # 스냅샷 저장 주기
   # save 900 1
   # save 300 10
   # save 60 10000
   ```

   - `dbfilename` : rdb 파일명 설정
   - `dir` : rdb/aof 저장 경로
   - `save sec cnt` : sec초 동안 cnt개 쓰기 작업 수행 시 저장

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
