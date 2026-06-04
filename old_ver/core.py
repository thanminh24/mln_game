import json
import os
from PIL import Image

STATE_FILE = "game_state.json"

def init_state():
    if not os.path.exists(STATE_FILE):
        ds = {
            "mode": "game1",
            "g1_opened": [],
            "g1_current_q": None,
            "g1_buzz_active": False,   # Chuông đang mở hay khóa?
            "g1_buzz_winner": None,    # Đội nào bấm nhanh nhất?
            "g1_buzz_type": None,      # Họ bấm giành "row" (hàng ngang) hay "keyword" (từ khóa)
            "g1_keyword_solved": False,# Từ khóa đã được giải chưa?
            
            "g2_vong": 0,
            "g2_cau": 0,
            "g2_manh_mo": [],
            "g2_done": False,
            
            "diem_so": {"Nhóm 1": 0, "Nhóm 2": 0, "Nhóm 3": 0, "Nhóm 4": 0, "Nhóm 6": 0},
            "trang_thai_vote": {"Nhóm 1": None, "Nhóm 2": None, "Nhóm 3": None, "Nhóm 4": None, "Nhóm 6": None},
            "cho_phep_vote": False,
            "da_cham_diem": False
        }
        with open(STATE_FILE, "w", encoding="utf-8") as f: json.dump(ds, f)

def read_state():
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f: return json.load(f)
    except: return None

def write_state(stt):
    with open(STATE_FILE, "w", encoding="utf-8") as f: json.dump(stt, f)

def tao_anh_manh_ghep(img_path, ds_manh_mo, tong_manh=4):
    try: img = Image.open(img_path).convert("RGB")
    except: img = Image.new("RGB", (800, 400), (150, 100, 100))
    w, h = img.size
    cw = w // tong_manh
    bg = Image.new("RGB", (w, h), (30, 30, 30))
    for i in range(tong_manh):
        if i in ds_manh_mo:
            box = (i * cw, 0, (i + 1) * cw, h)
            bg.paste(img.crop(box), box)
    return bg