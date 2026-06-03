# ==========================================
# DATA GAME 1: Ô CHỮ LÝ THUYẾT (Tự luận/Hỏi đáp)
# Từ khóa dọc: Y E U N U O C (YÊU NƯỚC) - Nằm ở cột index 12
# ==========================================
TUKHOA_DOC = "YÊU NƯỚC"
G1_DATA = [
    {"tu": "YTHUCXAHOI", "offset": 12, "q": "Theo triết học Mác - Lênin, mặt tinh thần của đời sống xã hội được gọi là gì?", "ans_full": "Ý THỨC XÃ HỘI"},
    {"tu": "DIEUKIENTUNHIEN", "offset": 10, "q": "Yếu tố nào của tồn tại xã hội gồm khí hậu, đất đai, sông ngòi, tài nguyên và vị trí địa lý?", "ans_full": "ĐIỀU KIỆN TỰ NHIÊN"},
    {"tu": "PHUONGTHUCSANXUATVATCHAT", "offset": 10, "q": "Trong ba yếu tố của tồn tại xã hội, yếu tố nào là cơ bản nhất, giữ vai trò quyết định?", "ans_full": "PHƯƠNG THỨC SẢN XUẤT VẬT CHẤT"},
    {"tu": "TONTAIXAHOI", "offset": 10, "q": "Theo chủ nghĩa duy vật lịch sử, cái gì giữ vai trò quyết định đối với ý thức xã hội?", "ans_full": "TỒN TẠI XÃ HỘI"},
    {"tu": "YTHUCXAHOITHONGTHUONG", "offset": 9, "q": "Loại ý thức xã hội nào hình thành tự phát từ đời sống hằng ngày, phong phú nhưng chưa được hệ thống hóa?", "ans_full": "Ý THỨC XÃ HỘI THÔNG THƯỜNG"},
    {"tu": "YTHUCXAHOIVUOTTRUOCTONTAIXAHOI", "offset": 0, "q": "Biểu hiện nào cho thấy ý thức xã hội có thể phản ánh đúng quy luật khách quan và dự báo tương lai trước khi tồn tại xã hội biến đổi đầy đủ?", "ans_full": "Ý THỨC XÃ HỘI VƯỢT TRƯỚC TỒN TẠI XÃ HỘI"},
    {"tu": "YTHUCDAODUC", "offset": 8, "q": "Trong các hình thái ý thức xã hội, hình thái nào phản ánh các chuẩn mực thiện - ác, tốt - xấu, lương tâm và trách nhiệm của con người?", "ans_full": "Ý THỨC ĐẠO ĐỨC"}
]

# ==========================================
# DATA GAME 2: LẬT TRANH THỰC TIỄN (Trắc nghiệm)
# ==========================================
G2_DATA = [
    {
        "ten_vong": "THỰC TIỄN 1: BẢN LĨNH LỊCH SỬ",
        "img_path": "ảnh_1_game_2.jpg",
        "giai_thich": "Bức ảnh mô tả trận chiến ĐIỆN BIÊN PHỦ lừng lẫy năm châu. Sức mạnh của lòng yêu nước và tinh thần đại đoàn kết đã giúp một dân tộc có nền kinh tế nông nghiệp lạc hậu đánh bại một thế lực phương Tây hiện đại. Điều này minh chứng: Ý thức xã hội có tính độc lập tương đối và có sự tác động trở lại mạnh mẽ, chuyển hóa thành sức mạnh vật chất khổng lồ để cải tạo Tồn tại xã hội.",
        "cau_hoi": [
            {"q": "Trong lịch sử kháng chiến chống thực dân Pháp (1945 - 1954), chiến dịch nào được ghi nhận là đỉnh cao thắng lợi, trực tiếp dẫn đến việc ký kết Hiệp định Giơ-ne-vơ?", "opts": {"A": "Chiến dịch Biên giới Thu Đông", "B": "Chiến dịch Tây Bắc", "C": "Chiến dịch Điện Biên Phủ", "D": "Chiến dịch Thượng Lào"}, "ans": "C"},
            {"q": "Xét dưới góc độ Triết học Mác - Lênin, tinh thần yêu nước, ý chí quyết chiến quyết thắng và lòng tự hào dân tộc của quân và dân ta trong cuộc chiến này thuộc về phạm trù nào sau đây?", "opts": {"A": "Tồn tại xã hội", "B": "Cơ sở hạ tầng", "C": "Ý thức xã hội", "D": "Lực lượng sản xuất"}, "ans": "C"},
            {"q": "Để bảo đảm hậu cần cho chiến trường trọng điểm này, hàng vạn dân công hỏa tuyến đã đồng lòng sử dụng phương tiện thô sơ nào dưới đây để vận chuyển hơn 2 vạn tấn lương thực?", "opts": {"A": "Xe ba gác", "B": "Xe thồ ngựa kéo", "C": "Xe đạp thồ", "D": "Xe cơ giới hoán cải"}, "ans": "C"},
            {"q": "Sức mạnh của lòng yêu nước giúp nền nông nghiệp lạc hậu đánh bại thế lực có tiềm lực quân sự, kinh tế hiện đại. Hiện tượng này chứng minh cho luận điểm triết học nào?", "opts": {"A": "Ý thức xã hội luôn luôn lạc hậu hơn tồn tại xã hội.", "B": "Tồn tại xã hội hoàn toàn độc lập với ý thức xã hội.", "C": "Tính độc lập tương đối và sự tác động trở lại mạnh mẽ của YTXH đối với TTXH.", "D": "Ý thức xã hội không có khả năng chuyển hóa thành sức mạnh vật chất."}, "ans": "C"},
            {"q": "Lá cờ 'Quyết chiến - Quyết thắng' tung bay trên nóc hầm chỉ huy của viên tướng Pháp nào, đánh dấu sự sụp đổ hoàn toàn của tập đoàn cứ điểm này?", "opts": {"A": "Tướng Navarre (Na-va)", "B": "Tướng De Castries (Đờ Cát-tơ-ri)", "C": "Tướng Cogny (Cô-nhi)", "D": "Tướng Salan (Sa-lăng)"}, "ans": "B"}
        ]
    },
    {
        "vong": 2,
        "ten_vong": "THỰC TIỄN 2: SỨC MẠNH THỜI BÌNH",
        "img_path": "anh_hien_tai.jpg", 
        "giai_thich": "Câu hỏi chốt (Dành cho MC): ẢNH DƯỚI ĐÂY MÔ TẢ HOẠT ĐỘNG GÌ ĐANG DIỄN RA? => ĐÁP ÁN: CỨU TRỢ ĐỒNG BÀO VÙNG LŨ. \n\n(Bài học triết học): Đứng trước điều kiện tự nhiên khắc nghiệt (Tồn tại xã hội), người Việt đã hình thành Ý thức xã hội tất yếu: Lòng yêu nước và tinh thần 'Lá lành đùm lá rách'. Sự quyên góp, hỗ trợ nhau trong bão lũ chính là minh chứng rõ nét cho việc Ý thức xã hội biến thành sức mạnh vật chất to lớn để tác động ngược lại, tái thiết Tồn tại xã hội.",
        "cau_hoi": [
            {
                "q": "Nước ta có vị trí địa lý đặc thù, thường xuyên đối mặt với điều kiện thời tiết khắc nghiệt. Theo triết học Mác - Lênin, yếu tố này thuộc về phạm trù nào?", 
                "opts": {"A": "Quan hệ sản xuất", "B": "Điều kiện tự nhiên (Tồn tại xã hội)", "C": "Kiến trúc thượng tầng", "D": "Lực lượng sản xuất"}, 
                "ans": "B"
            },
            {
                "q": "Từ hoàn cảnh sống nhiều gian khó đó, người Việt đã sớm hình thành truyền thống đùm bọc lẫn nhau. Theo chủ nghĩa duy vật lịch sử, sự hình thành này minh chứng cho quy luật nào?", 
                "opts": {"A": "Tồn tại xã hội quyết định ý thức xã hội", "B": "Ý thức xã hội quyết định tồn tại xã hội", "C": "Ý thức xã hội luôn vượt trước tồn tại xã hội", "D": "Tồn tại xã hội lệ thuộc vào ý thức xã hội"}, 
                "ans": "A"
            },
            {
                "q": "Trải qua ngàn năm, truyền thống 'thương người như thể thương thân' vẫn luôn được các thế hệ người Việt gìn giữ. Điều này thể hiện đặc tính nào của Ý thức xã hội?", 
                "opts": {"A": "Tính vượt trước", "B": "Tính kế thừa", "C": "Tính giai cấp", "D": "Tính bảo thủ"}, 
                "ans": "B"
            },
            {
                "q": "Khi cộng đồng gặp biến cố, tình cảm trừu tượng lập tức biến thành những hành động thiết thực đóng góp sức người, sức của để tái thiết cuộc sống. Đây là biểu hiện của nguyên lý nào?", 
                "opts": {"A": "YTXH luôn tụt hậu hơn TTXH", "B": "YTXH sinh ra TTXH", "C": "Sự tác động trở lại của YTXH đối với TTXH", "D": "TTXH không thể thay đổi"}, 
                "ans": "C"
            },
            {
                "q": "Từ mối quan hệ biện chứng trên, có thể kết luận tinh thần đoàn kết của người Việt Nam không chỉ là lý thuyết suông mà đã biến thành:", 
                "opts": {"A": "Khẩu hiệu phong trào", "B": "Một hệ thống pháp luật bắt buộc", "C": "Sự phản ánh thụ động", "D": "Sức mạnh vật chất to lớn để cải tạo xã hội"}, 
                "ans": "D"
            }
        ]
    }
]