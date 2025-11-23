# backend/flags.py
# authoritative server-side flags and points
FLAGS = {
    0: "FLAG{CSS_COLOR_REVEAL_001}",
    1: "FLAG{SELECT_TO_SEE_OMG}",
    2: "FLAG{VIEW_SOURCE_PRO}",
    3: "FLAG{HELLO_CONSOLE_USER}",
    4: "FLAG{ZOOM_IN_YOU_FOOL}",
    5: "FLAG{EX1F_MASTER_HUNTER}",
    6: "FLAG{LOCAL_STORAGE_LEGEND}",
    7: "FLAG{ROBOT_SNIFFER_1337}",
    8: "FLAG{SMART_HEADER_HACKER}",
    9: "FLAG{CAESAR_SHIFT_14_WIN}",
    10: "FLAG{ST3G0_LSB_H4CK3R}",
    11: "FLAG{PDF_LAYER_SECRET_999}"
}
POINTS = {i: (50 if i==0 else 100 + (i-1)*25) for i in range(0, 12)}
