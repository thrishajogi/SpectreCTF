from sqlmodel import select
from app.db import create_db_and_tables, get_session
from app.models import Flag, User

FLAGS = [
    "FLAG{CSS_COLOR_REVEAL_001}",
    "FLAG{SELECT_TO_SEE_OMG}",
    "FLAG{VIEW_SOURCE_PRO}",
    "FLAG{HELLO_CONSOLE_USER}",
    "FLAG{ZOOM_IN_YOU_FOOL}",
    "FLAG{EX1F_MASTER_HUNTER}",
    "FLAG{LOCAL_STORAGE_LEGEND}",
    "FLAG{ROBOT_SNIFFER_1337}",
    "FLAG{SMART_HEADER_HACKER}",
    "FLAG{CAESAR_SHIFT_14_WIN}",
    "FLAG{ST3G0_LSB_H4CK3R}",
    "FLAG{PDF_LAYER_SECRET_999}",
]

def seed():
    create_db_and_tables()
    session = get_session()
    for i, f in enumerate(FLAGS):
        lvl = i  # level 0..11
        exists = session.exec(select(Flag).where(Flag.level == lvl)).first()
        if not exists:
            session.add(Flag(level=lvl, flag=f))
    # add a test user
    test = session.exec(select(User).where(User.username == "player1")).first()
    if not test:
        session.add(User(username="player1", score=0, unlocked_level=0))
    session.commit()
    session.close()
    print("Seeded flags & test user")

if __name__ == "__main__":
    seed()
