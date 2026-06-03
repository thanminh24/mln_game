import streamlit as st
from core import write_state, tao_anh_manh_ghep
from data import G2_DATA

def render_host_game2(state):
    st.title("🧩 PHẦN 2: THỰC TIỄN & LÒNG YÊU NƯỚC")
    vong = state["g2_vong"]
    
    if vong >= len(G2_DATA):
        st.balloons(); st.header("🏆 KẾT THÚC TOÀN BỘ CHƯƠNG TRÌNH!")
        st.bar_chart(state["diem_so"])
    else:
        data = G2_DATA[vong]
        cau_idx = state["g2_cau"]
        cl, cr = st.columns([1.2, 1])
        
        with cr:
            st.markdown("### 🖼️ Bức Tranh Mảnh Ghép")
            if state["g2_done"]:
                try: st.image(data["img_path"], use_container_width=True)
                except: st.error("⚠️ Vui lòng kiểm tra lại file ảnh trong thư mục dự án!")
                st.success(f"**BÀI HỌC TRIẾT HỌC:** {data['giai_thich']}")
            else:
                anh_che = tao_anh_manh_ghep(data["img_path"], state["g2_manh_mo"], len(data["cau_hoi"]))
                st.image(anh_che, use_container_width=True)
                if st.button("🚨 GIẢI MÃ SỚM TRANH NÀY!"):
                    state["g2_done"] = True; write_state(state); st.rerun()

        with cl:
            st.markdown(f"## 🌍 {data['ten_vong']}")
            if state["g2_done"] or cau_idx >= len(data["cau_hoi"]):
                st.warning("Vòng chơi này đã hoàn tất!")
                if st.button("➡️ SANG TRANH TIẾP THEO"):
                    state["g2_vong"] += 1; state["g2_cau"] = 0; state["g2_manh_mo"] = []
                    state["g2_done"] = False; state["trang_thai_vote"] = {k: None for k in state["trang_thai_vote"]}
                    write_state(state); st.rerun()
            else:
                q_curr = data["cau_hoi"][cau_idx]
                st.info(f"**{q_curr['q']}**")
                for k, v in q_curr['opts'].items(): st.write(f"**{k}.** {v}")
                
                st.write("---")
                c1, c2 = st.columns(2)
                with c1:
                    if not state["cho_phep_vote"]:
                        if st.button("🟢 MỞ CỔNG BÌNH CHỌN"):
                            state["cho_phep_vote"] = True; state["da_cham_diem"] = False
                            write_state(state); st.rerun()
                    else:
                        if st.button("🔴 KHÓA CỔNG BÌNH CHỌN"):
                            state["cho_phep_vote"] = False; write_state(state); st.rerun()
                with c2:
                    if not state["cho_phep_vote"] and not state["da_cham_diem"]:
                        if st.button("💥 TÍNH ĐIỂM & LẬT MẢNH"):
                            has_correct = False
                            for doi, lc in state["trang_thai_vote"].items():
                                if lc == q_curr["ans"]:
                                    state["diem_so"][doi] += 20; has_correct = True
                            if has_correct and cau_idx not in state["g2_manh_mo"]:
                                state["g2_manh_mo"].append(cau_idx)
                            state["da_cham_diem"] = True; write_state(state); st.rerun()
                    if state["da_cham_diem"]:
                        if st.button("➡️ CÂU HỎI TIẾP THEO"):
                            state["g2_cau"] += 1; state["cho_phep_vote"] = False; state["da_cham_diem"] = False
                            state["trang_thai_vote"] = {k: None for k in state["trang_thai_vote"]}
                            write_state(state); st.rerun()

                st.write("---")
                st.markdown("### 📡 Trạng thái nộp bài")
                cols = st.columns(5)
                for idx, (doi, lc) in enumerate(state["trang_thai_vote"].items()):
                    with cols[idx]:
                        if lc is None: st.warning(f"⏳ {doi}")
                        else:
                            if state["da_cham_diem"]:
                                ic = "✅" if lc == q_curr["ans"] else "❌"
                                st.success(f"{ic} {lc}")
                            else: st.success("✅ Đã chốt")