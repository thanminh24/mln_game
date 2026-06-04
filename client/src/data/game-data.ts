// Client-side game data. Keep in sync with server/src/game/game-data.ts.
// answer_display intentionally omitted from G1 rows — MC reads from printed script.

export interface G1Row {
  word_ascii: string;
  word_length: number;
  col_offset: number;
  question_text: string;
}

export interface G2Question {
  question_text: string;
  opt_A: string;
  opt_B: string;
  opt_C: string;
  opt_D: string;
  correct_answer: string;
}

export interface G2Round {
  round_name: string;
  image_file: string;
  round_explanation: string;
  cau_hoi: G2Question[];
}

export const G1_DATA: G1Row[] = [
  {
    word_ascii: "YTHUCXAHOI",
    word_length: 10,
    col_offset: 12,
    question_text:
      "Theo triết học Mác - Lênin, mặt tinh thần của đời sống xã hội được gọi là gì?",
  },
  {
    word_ascii: "DIEUKIENTUNHIEN",
    word_length: 15,
    col_offset: 10,
    question_text:
      "Yếu tố nào của tồn tại xã hội gồm khí hậu, đất đai, sông ngòi, tài nguyên và vị trí địa lý?",
  },
  {
    word_ascii: "PHUONGTHUCSANXUATVATCHAT",
    word_length: 24,
    col_offset: 10,
    question_text:
      "Trong ba yếu tố của tồn tại xã hội, yếu tố nào là cơ bản nhất, giữ vai trò quyết định?",
  },
  {
    word_ascii: "TONTAIXAHOI",
    word_length: 11,
    col_offset: 10,
    question_text:
      "Theo chủ nghĩa duy vật lịch sử, cái gì giữ vai trò quyết định đối với ý thức xã hội?",
  },
  {
    word_ascii: "YTHUCXAHOITHONGTHUONG",
    word_length: 21,
    col_offset: 9,
    question_text:
      "Loại ý thức xã hội nào hình thành tự phát từ đời sống hằng ngày, phong phú nhưng chưa được hệ thống hóa?",
  },
  {
    word_ascii: "YTHUCXAHOIVUOTTRUOCTONTAIXAHOI",
    word_length: 30,
    col_offset: 0,
    question_text:
      "Biểu hiện nào cho thấy ý thức xã hội có thể phản ánh đúng quy luật khách quan và dự báo tương lai trước khi tồn tại xã hội biến đổi đầy đủ?",
  },
  {
    word_ascii: "YTHUCDAODUC",
    word_length: 11,
    col_offset: 8,
    question_text:
      "Trong các hình thái ý thức xã hội, hình thái nào phản ánh các chuẩn mực thiện - ác, tốt - xấu, lương tâm và trách nhiệm của con người?",
  },
];

export const G2_DATA: G2Round[] = [
  {
    round_name: "THỰC TIỄN 1: BẢN LĨNH LỊCH SỬ",
    image_file: "round1-dien-bien-phu.jpg",
    round_explanation:
      "Bức ảnh mô tả trận chiến ĐIỆN BIÊN PHỦ lừng lẫy năm châu. Sức mạnh của lòng yêu nước và tinh thần đại đoàn kết đã giúp một dân tộc có nền kinh tế nông nghiệp lạc hậu đánh bại một thế lực phương Tây hiện đại. Điều này minh chứng: Ý thức xã hội có tính độc lập tương đối và có sự tác động trở lại mạnh mẽ, chuyển hóa thành sức mạnh vật chất khổng lồ để cải tạo Tồn tại xã hội.",
    cau_hoi: [
      {
        question_text:
          "Trong lịch sử kháng chiến chống thực dân Pháp (1945 - 1954), chiến dịch nào được ghi nhận là đỉnh cao thắng lợi, trực tiếp dẫn đến việc ký kết Hiệp định Giơ-ne-vơ?",
        opt_A: "Chiến dịch Biên giới Thu Đông",
        opt_B: "Chiến dịch Tây Bắc",
        opt_C: "Chiến dịch Điện Biên Phủ",
        opt_D: "Chiến dịch Thượng Lào",
        correct_answer: "C",
      },
      {
        question_text:
          "Xét dưới góc độ Triết học Mác - Lênin, tinh thần yêu nước, ý chí quyết chiến quyết thắng và lòng tự hào dân tộc thuộc về phạm trù nào sau đây?",
        opt_A: "Tồn tại xã hội",
        opt_B: "Cơ sở hạ tầng",
        opt_C: "Ý thức xã hội",
        opt_D: "Lực lượng sản xuất",
        correct_answer: "C",
      },
      {
        question_text:
          "Để bảo đảm hậu cần, hàng vạn dân công hỏa tuyến đã sử dụng phương tiện nào để vận chuyển hơn 2 vạn tấn lương thực?",
        opt_A: "Xe ba gác",
        opt_B: "Xe thồ ngựa kéo",
        opt_C: "Xe đạp thồ",
        opt_D: "Xe cơ giới hoán cải",
        correct_answer: "C",
      },
      {
        question_text:
          "Sức mạnh lòng yêu nước giúp nông nghiệp lạc hậu đánh bại thế lực hiện đại. Hiện tượng này chứng minh cho luận điểm nào?",
        opt_A: "Ý thức xã hội luôn luôn lạc hậu hơn tồn tại xã hội.",
        opt_B: "Tồn tại xã hội hoàn toàn độc lập với ý thức xã hội.",
        opt_C: "Tính độc lập tương đối và sự tác động trở lại mạnh mẽ của YTXH đối với TTXH.",
        opt_D: "Ý thức xã hội không có khả năng chuyển hóa thành sức mạnh vật chất.",
        correct_answer: "C",
      },
      {
        question_text:
          "Lá cờ 'Quyết chiến - Quyết thắng' tung bay trên nóc hầm chỉ huy của viên tướng Pháp nào?",
        opt_A: "Tướng Navarre (Na-va)",
        opt_B: "Tướng De Castries (Đờ Cát-tơ-ri)",
        opt_C: "Tướng Cogny (Cô-nhi)",
        opt_D: "Tướng Salan (Sa-lăng)",
        correct_answer: "B",
      },
    ],
  },
  {
    round_name: "THỰC TIỄN 2: SỨC MẠNH THỜI BÌNH",
    image_file: "round2-cuu-tro-lu.jpg",
    round_explanation:
      "Đứng trước điều kiện tự nhiên khắc nghiệt (Tồn tại xã hội), người Việt đã hình thành Ý thức xã hội tất yếu: Lòng yêu nước và tinh thần 'Lá lành đùm lá rách'. Sự quyên góp, hỗ trợ nhau trong bão lũ chính là minh chứng rõ nét cho việc Ý thức xã hội biến thành sức mạnh vật chất to lớn để tác động ngược lại, tái thiết Tồn tại xã hội.",
    cau_hoi: [
      {
        question_text:
          "Nước ta thường xuyên đối mặt với điều kiện thời tiết khắc nghiệt. Theo triết học Mác - Lênin, yếu tố này thuộc về phạm trù nào?",
        opt_A: "Quan hệ sản xuất",
        opt_B: "Điều kiện tự nhiên (Tồn tại xã hội)",
        opt_C: "Kiến trúc thượng tầng",
        opt_D: "Lực lượng sản xuất",
        correct_answer: "B",
      },
      {
        question_text:
          "Người Việt đã sớm hình thành truyền thống đùm bọc lẫn nhau. Theo chủ nghĩa duy vật lịch sử, sự hình thành này minh chứng cho quy luật nào?",
        opt_A: "Tồn tại xã hội quyết định ý thức xã hội",
        opt_B: "Ý thức xã hội quyết định tồn tại xã hội",
        opt_C: "Ý thức xã hội luôn vượt trước tồn tại xã hội",
        opt_D: "Tồn tại xã hội lệ thuộc vào ý thức xã hội",
        correct_answer: "A",
      },
      {
        question_text:
          "Truyền thống 'thương người như thể thương thân' được các thế hệ người Việt gìn giữ. Điều này thể hiện đặc tính nào của Ý thức xã hội?",
        opt_A: "Tính vượt trước",
        opt_B: "Tính kế thừa",
        opt_C: "Tính giai cấp",
        opt_D: "Tính bảo thủ",
        correct_answer: "B",
      },
      {
        question_text:
          "Tình cảm trừu tượng lập tức biến thành hành động thiết thực đóng góp sức người, sức của để tái thiết cuộc sống. Đây là biểu hiện của nguyên lý nào?",
        opt_A: "YTXH luôn tụt hậu hơn TTXH",
        opt_B: "YTXH sinh ra TTXH",
        opt_C: "Sự tác động trở lại của YTXH đối với TTXH",
        opt_D: "TTXH không thể thay đổi",
        correct_answer: "C",
      },
      {
        question_text:
          "Tinh thần đoàn kết của người Việt Nam không chỉ là lý thuyết suông mà đã biến thành:",
        opt_A: "Khẩu hiệu phong trào",
        opt_B: "Một hệ thống pháp luật bắt buộc",
        opt_C: "Sự phản ánh thụ động",
        opt_D: "Sức mạnh vật chất to lớn để cải tạo xã hội",
        correct_answer: "D",
      },
    ],
  },
];
