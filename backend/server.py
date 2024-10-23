import json
from datetime import datetime

from fastapi import FastAPI, WebSocket, websockets
from fastapi.middleware.cors import CORSMiddleware

import app_types as types
import consts
from multiprocess_run import start

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/grid-config")
def save_map(name: str, grid: types.GridConfig):
    fname = ".".join(("grid", name, datetime.now().isoformat().replace(":", "-"), "json"))
    with open(consts.GRIDS_FOLDER / fname, "w") as fp:
        json.dump(grid.model_dump(), fp, indent=2)
    return {"success": True}


@app.post("/run")
def run(
    grid: types.Grid,
    grid_params: types.GridParams,
    run_params: types.RunParams,
    storm: types.Storm,
):
    start(grid=grid, grid_params=grid_params, run_params=run_params, storm=storm)
    return {"status": "started"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await manager.connect(websocket)
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except websockets.WebSocketDisconnect:
        manager.disconnect(websocket)


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()
