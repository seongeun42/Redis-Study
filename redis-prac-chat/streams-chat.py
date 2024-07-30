from fastapi import FastAPI, Depends
from starlette.responses import HTMLResponse
from starlette.websockets import WebSocket
from starlette.staticfiles import StaticFiles
from redis.asyncio import Redis
import uvicorn, datetime, asyncio

HOST = "localhost"
PORT = 8080
STREAM_MAX_LEN = 1000

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

redisClient = Redis(host='localhost', port=6379, password=1203, decode_responses=True)

async def read_message(websocket: WebSocket, join_info: dict):
    print("read : hihihihii")
    connected = True
    is_first = True
    stream_id = '$'
    while connected:
        try:
            count = 1 if is_first else 100
            results = await redisClient.xread(streams={join_info['room']: stream_id}, count=count, block=100000)
            for room, events in results:
                if join_info['room'] != room:
                    continue
                for e_id, e in events:
                    now = datetime.datetime.now()
                    await websocket.send_text(f"{now.strftime('%H:%M')} {e['msg']}")
                    stream_id = e_id
                if is_first:
                    is_first = False
        except:
            await redisClient.aclose()
            connected = False

async def write_message(websocket: WebSocket, join_info):
    await notify(join_info, 'joined')
    connected = True
    while connected:
        try:
            data = await websocket.receive_text()
            await redisClient.xadd(join_info['room'], {'username': join_info['username'], 'msg': data}, id=b'*', maxlen=STREAM_MAX_LEN)
        except:
            await notify(join_info, 'left')
            await redisClient.aclose()
            connected = False

async def notify(join_info: dict, action: str):
    try:
        await redisClient.xadd(join_info['room'], {'msg': f"{join_info['username']} has {action}"}, id=b'*', maxlen=STREAM_MAX_LEN)
    except:
        print("notify exception")

async def get_joininfo(username: str = None, room: str = None):
    return {"username": username, "room": room}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, join_info: dict = Depends(get_joininfo)):
    await websocket.accept()
    await asyncio.gather(write_message(websocket, join_info), read_message(websocket, join_info))

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)