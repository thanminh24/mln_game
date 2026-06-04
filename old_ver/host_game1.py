import streamlit as st
from core import write_state
from data import G1_DATA, TUKHOA_DOC

def render_host_game1(state):
    st.title("🔠 PHẦN 1: GIẢI MÃ LÝ THUYẾT")
    
    # Nếu từ khóa được giải, mở bung tất cả các hàng
    if state["g1_keyword_solved"]:
        state["g1_opened"] = list(range(len(G1_DATA)))
    
    st.markdown("<h3 style='text-align: center;'>🎯 Bảng Ô Chữ</h3>", unsafe_allow_html=True)
    
    html_table = "<table style='font-size:16px; font-weight:bold; text-align:center; margin: 0 auto 30px auto; border-collapse: separate; border-spacing: 2px;'>"
    for i, row in enumerate(G1_DATA):
        html_table += "<tr>"
        word = row["tu"] if i in state["g1_opened"] else "_" * len(row["tu"])
        full_row = [""] * 35
        for j, char in enumerate(word): 
            full_row[j + row["offset"]] = char
        for j in range(35):
            bg_color = "#e74c3c" if j == 12 and i in state["g1_opened"] else ("#3498db" if full_row[j] != "" else "transparent")
            border = "2px solid #ccc" if (j >= row["offset"] and j < row["offset"] + len(row["tu"])) else "none"
            box_shadow = "box-shadow: 1px 1px 3px rgba(0,0,0,0.2);" if full_row[j] != "" else ""
            html_table += f"<td style='width:22px; height:22px; border:{border}; background-color:{bg_color}; color:white; border-radius:3px; {box_shadow}'>{full_row[j]}</td>"
        html_table += "</tr>"
    html_table += "</table>"
    st.markdown(html_table, unsafe_allow_html=True)
    
    if state["g1_keyword_solved"]:
        st.success(f"🎉 TỪ KHÓA ĐÃ ĐƯỢC GIẢI MÃ: **{TUKHOA_DOC}**")
        st.info("Hãy chuyển sang Phần 2 để tiếp tục chương trình!")

    st.write("---")

    c_left, c_right = st.columns([1.2, 1])

    with c_left:
        st.markdown("### ❓ Bảng Điều Khiển")
        
        if state["g1_keyword_solved"]:
            st.balloons()
            st.warning("Trò chơi Ô chữ đã kết thúc!")
        else:
            # 1. TRẠNG THÁI CÓ ĐỘI BẤM CHUÔNG
            if state["g1_buzz_winner"]:
                if state["g1_buzz_type"] == "keyword":
                    st.error(f"🚨 **{state['g1_buzz_winner']}** ĐÃ BẤM CHUÔNG GIẢI TỪ KHÓA DỌC!")
                    c1, c2 = st.columns(2)
                    with c1:
                        if st.button("✅ CHÍNH XÁC (Cộng 30đ & WIN)", type="primary", use_container_width=True):
                            state["diem_so"][state["g1_buzz_winner"]] += 30
                            state["g1_keyword_solved"] = True
                            state["g1_buzz_winner"] = None
                            write_state(state); st.rerun()
                    with c2:
                        if st.button("❌ SAI (Bỏ qua & Tiếp tục)", use_container_width=True):
                            state["g1_buzz_active"] = False # Đóng chuông để Host chọn tiếp
                            state["g1_buzz_winner"] = None
                            write_state(state); st.rerun()
                            
                elif state["g1_buzz_type"] == "row":
                    # ĐÃ XÓA DÒNG HIỂN THỊ ĐÁP ÁN Ở ĐÂY ĐỂ TRÁNH LỘ BÀI TRÊN MÁY CHIẾU
                    st.info(f"🎯 **{state['g1_buzz_winner']}** giành quyền trả lời HÀNG NGANG SỐ {state['g1_current_q'] + 1}!")
                    c1, c2 = st.columns(2)
                    with c1:
                        if st.button("✅ ĐÚNG (Cộng 10đ & Mở ô)", type="primary", use_container_width=True):
                            state["diem_so"][state["g1_buzz_winner"]] += 10
                            state["g1_opened"].append(state["g1_current_q"])
                            state["g1_buzz_winner"] = None
                            state["g1_current_q"] = None
                            write_state(state); st.rerun()
                    with c2:
                        if st.button("❌ SAI (Khóa đội & Mở lại chuông)", use_container_width=True):
                            state["g1_buzz_active"] = True
                            state["g1_buzz_winner"] = None
                            write_state(state); st.rerun()
                            
            # 2. TRẠNG THÁI BÌNH THƯỜNG (CHƯA AI BẤM CHUÔNG)
            else:
                options = [f"Hàng {i+1} ({len(G1_DATA[i]['tu'])} chữ cái)" for i in range(len(G1_DATA)) if i not in state["g1_opened"]]
                if options:
                    chon_hang = st.selectbox("Chọn hàng để hỏi:", options)
                    idx = int(chon_hang.split(" ")[1]) - 1
                    
                    if st.button("Chọn câu hỏi này"):
                        state["g1_current_q"] = idx
                        state["g1_buzz_active"] = False
                        write_state(state); st.rerun()
                        
                    if state["g1_current_q"] is not None:
                        q_data = G1_DATA[state["g1_current_q"]]
                        st.info(f"**{q_data['q']}**")
                        
                        if not state["g1_buzz_active"]:
                            if st.button("🟢 MỞ CHUÔNG GIÀNH QUYỀN HÀNG NGANG", type="primary"):
                                state["g1_buzz_active"] = True
                                write_state(state); st.rerun()
                        else:
                            st.warning("⏳ Đang chờ các đội bấm chuông...")
                            if st.button("🔴 KHÓA CHUÔNG LẠI"):
                                state["g1_buzz_active"] = False
                                write_state(state); st.rerun()
                else:
                    st.success("Đã mở hết hàng ngang! Chờ đội giải từ khóa dọc...")

    with c_right:
        st.markdown("### 📊 Bảng điểm")
        st.bar_chart(state["diem_so"])