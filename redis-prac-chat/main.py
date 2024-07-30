# import redis
#
#
# def main():
#     client = redis.Redis(host='localhost', port=6379, password=1203, decode_responses=True)
#     stream_name = 'mystream'
#
#     # 메시지 추가
#     message_id = client.xadd(stream_name, {'field1': 'value1', 'field2': 'value2'})
#     print(f"Message ID: {message_id}")
#
#     # 메시지 읽기
#     messages = client.xrange(stream_name, count=10)
#     for message_id, fields in messages:
#         print(f"Message ID: {message_id}, Fields: {fields}")
#
#     # Consumer Group 사용 예제
#     group_name = 'mygroup'
#     client.xgroup_create(stream_name, group_name, id='0', mkstream=True)
#
#     consumer_name = 'myconsumer'
#     messages = client.xreadgroup(group_name, consumer_name, {stream_name: '>'}, count=10)
#     for stream, message_list in messages:
#         for message_id, fields in message_list:
#             print(f"Message ID: {message_id}, Fields: {fields}")
#
#
# if __name__ == "__main__":
#     main()