import streamlit as st
import os
from core import init_state, read_state, write_state
from host_game1 import render_host_game1
from host_game2 import render_host_game2

init_state()

role = st.query_params.get("role", "player")
if "my_team" not in st.session_state: st.session_state.my_team = None
state = read_state()

# ==========================================
# GIAO DIỆN HOST (MÁY CHIẾU)
# ==========================================
if role == "host":
    from streamlit_autorefresh import st_autorefresh
    # Host tự động làm mới nếu đang chờ chuông hàng ngang hoặc chờ có người bấm Từ khóa dọc
    host_cho_chuong = (state["mode"] == "game1" and (state["g1_buzz_active"] or not state["g1_buzz_winner"]))
    host_cho_vote = (state["mode"] == "game2" and state["cho_phep_vote"] and not state["da_cham_diem"])
    if host_cho_chuong or host_cho_vote:
        st_autorefresh(interval=1000, limit=None, key="host_live_update")

    st.sidebar.title("🎮 ĐIỀU KHIỂN CHUNG")
    new_mode = st.sidebar.radio("Chuyển phần chơi:", ["Phần 1: Ô Chữ Lý Thuyết", "Phần 2: Lật Tranh Thực Tiễn"])
    new_mode_val = "game1" if "Phần 1" in new_mode else "game2"
    
    if new_mode_val != state["mode"]:
        state["mode"] = new_mode_val
        state["cho_phep_vote"] = False
        state["da_cham_diem"] = False
        state["trang_thai_vote"] = {k: None for k in state["trang_thai_vote"]}
        state["g1_buzz_active"] = False
        state["g1_buzz_winner"] = None
        write_state(state); st.rerun()
        
    st.sidebar.write("---")
    st.sidebar.button("🔄 Làm mới dữ liệu (F5)")
    if st.sidebar.button("⚠️ Reset Toàn Bộ Game"):
        if os.path.exists("game_state.json"): os.remove("game_state.json")
        init_state(); st.rerun()
    
    if state["mode"] == "game1": render_host_game1(state)
    elif state["mode"] == "game2": render_host_game2(state)

# ==========================================
# GIAO DIỆN PLAYER (ĐIỆN THOẠI NGƯỜI CHƠI)
# ==========================================
elif role == "player":
    if st.session_state.my_team is None:
        st.title("👋 CHÀO MỪNG ĐẾN VỚI GAME TRIẾT HỌC")
        doi = st.selectbox("Chọn đội:", ["Đội 1", "Đội 2", "Đội 3", "Đội 4", "Đội 5"])
        if st.button("🚀 VÀO GAME"):
            st.session_state.my_team = doi; st.rerun()
    else:
        team = st.session_state.my_team
        st.title(f"📱 {team}")
        
        from streamlit_autorefresh import st_autorefresh
        # Player tự động làm mới liên tục trong game 1 (để bắt kịp sự kiện cướp từ khóa)
        dang_cho_chuong = (state["mode"] == "game1" and not state["g1_keyword_solved"])
        dang_cho_vote = (state["mode"] == "game2" and not state["cho_phep_vote"])
        if dang_cho_chuong or dang_cho_vote:
            st_autorefresh(interval=1000, limit=None, key="player_waiting")
        
        # --------- PHẦN 1: BẤM CHUÔNG Ô CHỮ ---------
        if state["mode"] == "game1":
            st.markdown("**Đang chơi: Phần 1 - Giải mã Ô chữ**")
            
            # TRẠNG THÁI 1: Game đã kết thúc
            if state["g1_keyword_solved"]:
                st.success("🎉 TỪ KHÓA ĐÃ ĐƯỢC GIẢI MÃ! Hãy chờ Host chuyển game.")
            
            # TRẠNG THÁI 2: Có đội vừa bấm chuông (Hàng ngang hoặc Từ khóa)
            elif state["g1_buzz_winner"]:
                if state["g1_buzz_winner"] == team:
                    st.success("🎤 BẠN ĐANG GIÀNH QUYỀN TRẢ LỜI! Hãy đứng lên trả lời qua mic.")
                else:
                    st.error(f"🚨 TẠM DỪNG! Đội **{state['g1_buzz_winner']}** đang trả lời...")
            
            # TRẠNG THÁI 3: Bình thường chờ lệnh
            else:
                # NÚT TỪ KHÓA DỌC LUÔN LUÔN BẬT
                st.write("🔥 **TỪ KHÓA DỌC (Luôn mở - 30đ)**")
                if st.button("🚀 BẤM CHUÔNG GIẢI TỪ KHÓA", type="primary", use_container_width=True):
                    current_state = read_state()
                    if not current_state["g1_buzz_winner"]: # Tránh lỗi race condition 2 đội bấm cùng lúc
                        current_state["g1_buzz_active"] = False
                        current_state["g1_buzz_winner"] = team
                        current_state["g1_buzz_type"] = "keyword"
                        write_state(current_state)
                    st.rerun()

                st.write("---")
                
                # NÚT HÀNG NGANG CHỈ BẬT KHI HOST CHO PHÉP
                if state["g1_buzz_active"]:
                    st.write("🔔 **CHUÔNG HÀNG NGANG ĐÃ MỞ!**")
                    if st.button("✋ GIÀNH QUYỀN HÀNG NGANG (10đ)", use_container_width=True):
                        current_state = read_state()
                        if current_state["g1_buzz_active"] and not current_state["g1_buzz_winner"]:
                            current_state["g1_buzz_active"] = False
                            current_state["g1_buzz_winner"] = team
                            current_state["g1_buzz_type"] = "row"
                            write_state(current_state)
                        st.rerun()
                else:
                    st.warning("🔒 Chuông hàng ngang đang khóa. Hãy chú ý lắng nghe câu hỏi!")
                    
        # --------- PHẦN 2: BÌNH CHỌN TRẮC NGHIỆM ---------
        elif state["mode"] == "game2":
            st.markdown("**Đang chơi: Phần 2 - Lật tranh Thực tiễn**")
            if not state["cho_phep_vote"]:
                st.warning("🔒 Host đang khóa cổng bình chọn! (Tự động cập nhật...)")
            else:
                lc = state["trang_thai_vote"][team]
                if lc:
                    st.success(f"Bạn đã chốt đáp án: **{lc}**")
                    if st.button("Đổi đáp án"):
                        state["trang_thai_vote"][team] = None; write_state(state); st.rerun()
                else:
                    st.write("Chọn đáp án trên điện thoại của bạn:")
                    if st.button("Chọn A", use_container_width=True): state["trang_thai_vote"][team] = "A"; write_state(state); st.rerun()
                    if st.button("Chọn B", use_container_width=True): state["trang_thai_vote"][team] = "B"; write_state(state); st.rerun()
                    if st.button("Chọn C", use_container_width=True): state["trang_thai_vote"][team] = "C"; write_state(state); st.rerun()