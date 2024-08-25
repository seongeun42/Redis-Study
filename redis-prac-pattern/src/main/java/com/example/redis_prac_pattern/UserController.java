package com.example.redis_prac_pattern;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("redis")
public class UserController {

  private final UserService userService;

  @GetMapping("{id}")
  public ResponseEntity<?> getUser(@PathVariable("id") Long id) throws JsonProcessingException {
    return ResponseEntity.ok().body(userService.getUser(id));
  }

  @PostMapping()
  public ResponseEntity<?> saveUser(@RequestBody ReqDto dto) throws JsonProcessingException {
    return ResponseEntity.status(HttpStatus.CREATED).body(userService.saveUser(dto));
  }

  @PatchMapping("{id}")
  public ResponseEntity<?> saveUser(@PathVariable("id") Long id, @RequestBody ReqDto dto)
      throws JsonProcessingException {
    return ResponseEntity.ok().body(userService.updateUser(id, dto));
  }

}
