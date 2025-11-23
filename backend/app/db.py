import os
from sqlmodel import create_engine, Session, SQLModel

DB_FILE = os.path.join(os.path.dirname(__file__), "..", "ctf.db")
DB_URL = f"sqlite:///{os.path.abspath(DB_FILE)}"

engine = create_engine(DB_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)
