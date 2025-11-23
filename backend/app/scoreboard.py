# backend/scoreboard.py
from typing import List
from fastapi import WebSocket
import asyncio

class ScoreboardManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.lock = asyncio.Lock()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        try:
            self.active_connections.remove(ws)
        except ValueError:
            pass

    async def broadcast(self, message):
        dead = []
        for ws in list(self.active_connections):
            try:
                await ws.send_json(message)
            except:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)
