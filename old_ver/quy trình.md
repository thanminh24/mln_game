# 📚 HƯỚNG DẪN VẬN HÀNH GAME TRIẾT HỌC MLN111 (BẢN HOÀN THIỆN)

**Dự án:** Game tương tác "Tồn tại xã hội & Ý thức xã hội - Lòng yêu nước Việt Nam"[cite: 1]
**Kiến trúc:** Modular (Streamlit + Ngrok + Auto-refresh)

---

## 📂 1. YÊU CẦU CẤU TRÚC THƯ MỤC

Người phụ trách kỹ thuật (cắm máy chiếu) phải đảm bảo thư mục dự án có chính xác các file sau trước khi lên lớp:

*   `data.py`: Dữ liệu câu hỏi, kịch bản (Đã cập nhật câu hỏi về Chiến dịch Điện Biên Phủ)[cite: 2].
*   `core.py`: Lõi xử lý logic, state và thuật toán cắt ảnh.
*   `host_game1.py`: Giao diện Máy chiếu - Phần 1 (Ô chữ Buzzer).
*   `host_game2.py`: Giao diện Máy chiếu - Phần 2 (Lật tranh với 4 đáp án A, B, C, D)[cite: 2].
*   `mln.py`: File chạy chính (Router & Giao diện Điện thoại).
*   `anh_dien_bien_phu.jpg`: Ảnh vòng 1 (Trận Điện Biên Phủ).
*   `anh_hien_tai.jpg`: Ảnh vòng 2 (Cứu trợ bão lũ).
*   `infographic.html`: Trang web tĩnh tổng kết bài học.

---

## ⚙️ 2. CÀI ĐẶT MÔI TRƯỜNG (Bắt buộc)

Vì hệ thống đã được nâng cấp tính năng **Thời gian thực (Real-time)**, máy tính chạy server bắt buộc phải cài đặt thêm các thư viện hỗ trợ. 

Mở Terminal hoặc PowerShell và chạy lệnh sau:
```bash
    pip install streamlit pillow streamlit-autorefresh
    ```

🚀 3. QUY TRÌNH KHỞI CHẠY
Bạn cần mở và chạy song song 2 cửa sổ Terminal:

Terminal 1 (Bật Server Game):
```bash
    streamlit run app.py
    ```
2.  **Terminal 2 (Bật Cổng mạng Ngrok):**
```bash
    ngrok http 127.0.0.1:8501
    ```

**Cách chia sẻ link cho lớp:**
*   **Dành cho Máy chiếu (Host):** Copy link Ngrok ở Terminal 2, thêm đuôi `?role=host` vào sau cùng ('https://starless-supervise-borrowing.ngrok-free.dev/?role=host'). Bấm **F11** để phóng to toàn màn hình.
*   **Dành cho Lớp học (Player):** Sử dụng link Ngrok gốc (không thêm đuôi) để tạo mã QR Code. Chiếu mã QR này lên slide PowerPoint để đại diện 5 nhóm dùng điện thoại quét và đăng nhập.

---

## 🎤 4. KỊCH BẢN ĐIỀU PHỐI (KỸ THUẬT & MC)

> 💡 **LƯU Ý CHUNG:** Điện thoại của người chơi và màn hình máy chiếu đã được tích hợp **Auto-refresh**.

### 🔠 GAME 1: GIẢI MÃ Ô CHỮ LÝ THUYẾT (CHUÔNG GIÀNH QUYỀN)
*   **Kỹ thuật:** Chọn câu hỏi Hàng ngang ở Menu bên phải -> Bấm **"🟢 MỞ CHUÔNG GIÀNH QUYỀN HÀNG NGANG"**.
*   **Người chơi:** Nút bấm chuông trên điện thoại sẽ tự động hiện ra. Đội nào bấm nhanh nhất, màn hình máy chiếu sẽ báo động đỏ 🚨 và tên đội đó hiện lên. Máy của 4 đội còn lại sẽ bị khóa và hiện "TẠM DỪNG".
*   **MC:** Yêu cầu đội giành được quyền đọc to đáp án. Đối chiếu với kịch bản Word trên tay (màn hình sẽ không hiển thị đáp án để tránh lộ bài).
*   **Kỹ thuật:**
    *   Nếu đúng: Bấm **"✅ ĐÚNG"** (Hệ thống tự cộng 10đ và lật ô chữ).
    *   Nếu sai: Bấm **"❌ SAI"** (Hệ thống mở lại chuông cho các đội khác giành quyền).
*   **🚀 NÚT TỪ KHÓA DỌC (YÊU NƯỚC):** Nút này trên điện thoại luôn luôn mở[cite: 1]. Bất cứ lúc nào có đội liều lĩnh bấm giải từ khóa dọc (Cộng 30 điểm)[cite: 1], hệ thống sẽ ngắt toàn bộ game và báo động đỏ. MC hãy tận dụng để đẩy không khí lớp học lên cao trào!

### 🧩 GAME 2: LẬT TRANH THỰC TIỄN (TRẮC NGHIỆM A, B, C, D)
*   **Kỹ thuật:** Dùng menu bên trái chuyển sang **Phần 2**. Điện thoại người chơi sẽ tự động chuyển giao diện.
*   **Kỹ thuật:** Bấm **"🟢 MỞ CỔNG BÌNH CHỌN"**. (Lúc này điện thoại của cả lớp sẽ hiện 4 nút A, B, C, D).
*   **MC:** Đọc to câu hỏi trắc nghiệm và đếm ngược 10 - 15 giây.
*   **Kỹ thuật:** Nhìn bảng trạng thái tự động cập nhật, khi 5 đội đều báo "✅ Đã chốt", bấm **"🔴 KHÓA CỔNG BÌNH CHỌN"** -> Bấm **"💥 TÍNH ĐIỂM & LẬT MẢNH"**.
*   **MC (Chốt tranh):** 
    *   Khi bức tranh 1 lật mở hoàn toàn, MC hỏi: *"Ảnh dưới đây mô tả trận chiến nào?"* -> Chốt đáp án: **ĐIỆN BIÊN PHỦ**[cite: 2].
    *   Khi bức tranh 2 lật mở hoàn toàn, MC hỏi: *"Ảnh dưới đây mô tả hoạt động gì?"* -> Chốt đáp án: **CỨU TRỢ ĐỒNG BÀO VÙNG LŨ**.
    *   *MC đọc to phần Bài học Triết học màu xanh lá cây hiện trên màn hình máy chiếu để chốt lại ý nghĩa.*

### 📊 TỔNG KẾT: INFOGRAPHIC
*   **Kỹ thuật:** Ẩn cửa sổ trình duyệt Game, mở trực tiếp file `infographic.html` đã chuẩn bị sẵn từ thư mục máy tính.
*   **MC:** Sử dụng Infographic để tổng kết lại toàn bộ bài thuyết trình một cách trực quan và chuyên nghiệp nhất.

---

## 🚨 5. XỬ LÝ SỰ CỐ NHANH

*   **Web nháy/chớp liên tục trên máy chiếu:** Đây là hiện tượng bình thường do `streamlit-autorefresh` đang hoạt động ngầm (1 giây/lần) để chờ tín hiệu bấm chuông. Màn hình sẽ tự đứng im khi có thao tác mới.
*   **Chuyển Game bị kẹt nút hoặc lỗi hiển thị:** Chỉ cần Host bấm vào nút **"⚠️ Reset Toàn Bộ Game"** ở thanh menu bên trái. Hệ thống sẽ tự dọn dẹp và khôi phục mượt mà.
*   **Khán giả bị rớt mạng/Tắt nhầm tab web:** Chỉ cần quét lại mã QR, chọn lại đúng tên Đội của mình. Hệ thống sẽ tự động đồng bộ lại đúng trạng thái hiện tại của đội đó (kể cả đáp án vừa chọn xong).