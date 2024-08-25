package com.example.redis_prac_pattern;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final ObjectMapper objectMapper;
  private final RedisTemplate<String, Object> redisTemplate;

  // 지연 로딩 패턴
  @Transactional(readOnly = true)
  public User getUser(Long id) throws JsonProcessingException {
    // 캐시 조회
    String data = (String) redisTemplate.opsForValue().get("user" + id);
    if (data != null) {
      log.info("캐시 적중 - 캐시 조회");
      return objectMapper.readValue(data, User.class);
    }
    // 캐시에 없으면 DB 조회
    log.info("캐시 미스 - DB 조회");
    User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("데이터가 존재하지 않습니다."));
    // 캐시에 저장
    String userJson = objectMapper.writeValueAsString(user);
    redisTemplate.opsForValue().set("user" + id, userJson, 60, TimeUnit.SECONDS);
    return user;
  }

  // Write-Through 패턴
  public Long saveUser(ReqDto dto) throws JsonProcessingException {
    User user = User.builder().name(dto.getName()).age(dto.getAge()).build();
    // DB 저장
    Long id = userRepository.save(user).getId();
    // 캐시 저장
    String userJson = objectMapper.writeValueAsString(user);
    redisTemplate.opsForValue().set("user" + id, userJson, 60, TimeUnit.SECONDS);
    return id;
  }

  public Long updateUser(Long id, ReqDto dto) throws JsonProcessingException {
    User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("데이터가 존재하지 않습니다."));
    // DB 업데이트
    user.updateName(dto.getName());
    user.updateAge(dto.getAge());
    // 캐시 업데이트
    String userJson = objectMapper.writeValueAsString(user);
    redisTemplate.opsForValue().set("user" + id, userJson, 60, TimeUnit.SECONDS);
    return id;
  }

}
