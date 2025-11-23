from sqlmodel import SQLModel, Field
from datetime import datetime


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str
    password: str


class Flag(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    level: int
    flag: str
    points: int


class Solve(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    flag_id: int = Field(foreign_key="flag.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
