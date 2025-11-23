from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlmodel import select
from app.db import create_db_and_tables, get_session
from app.models import User, Flag, Solve
import os

app = FastAPI(title="SpectreCTF API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- FIXED STATIC PATH ---
STATIC_PATH = os.path.join(os.path.dirname(__file__), "static")

STATIC_PATH = os.path.join(os.path.dirname(__file__), "..", "static")

app.mount("/static", StaticFiles(directory=STATIC_PATH), name="static")


@app.get("/")
def root():
    return FileResponse(os.path.join(STATIC_PATH, "index.html"))


class RegisterPayload(BaseModel):
    username: str

class SubmitPayload(BaseModel):
    username: str
    level: int
    flag: str


create_db_and_tables()


@app.post("/register")
def register(p: RegisterPayload):
    session = get_session()
    exists = session.exec(select(User).where(User.username == p.username)).first()
    if exists:
        raise HTTPException(400, "Username exists")
    u = User(username=p.username, score=0, unlocked_level=0)
    session.add(u)
    session.commit()
    return {"ok": True}


@app.get("/levels")
def levels():
    session = get_session()
    all_flags = session.exec(select(Flag)).all()
    return {
        "levels": len(all_flags),
        "pdf": "/static/Cyber-Security.pdf"
    }


@app.post("/submit")
def submit(p: SubmitPayload):
    session = get_session()
    user = session.exec(select(User).where(User.username == p.username)).first()
    if not user:
        raise HTTPException(404, "User not found")

    if p.level != user.unlocked_level:
        raise HTTPException(400, "Locked level")

    correct_flag = session.exec(select(Flag).where(Flag.level == p.level)).first()
    if p.flag.strip() != correct_flag.flag:
        raise HTTPException(400, "Incorrect flag")

    user.unlocked_level += 1
    user.score += 100
    session.add(user)
    session.commit()
    return {"ok": True, "next": user.unlocked_level}


@app.get("/scoreboard")
def scoreboard():
    session = get_session()
    users = session.exec(select(User).order_by(User.score.desc())).all()
    return users
