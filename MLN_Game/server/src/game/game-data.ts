// Server-side game data. Keep in sync with client/src/data/game-data.ts.

export interface CrosswordOption {
  id: string;
  text: string;
}

export interface CrosswordRow {
  answerAscii: string;
  wordLength: number;
  colOffset: number;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  questionText: string;
  answerText: string;
  correctOptionId: string;
  options: CrosswordOption[];
  promptImage?: string;
  explanation: string;
}

export const KEYWORD = "LÒNG YÊU NƯỚC";
export const KEYWORD_ASCII = "LONGYEUNUOC";

export const CROSSWORD_ROWS: CrosswordRow[] = [
  {
    answerAscii: "LACHAU",
    wordLength: 6,
    colOffset: 12,
    difficulty: "medium",
    points: 20,
    questionText:
      "Dù đời sống vật chất đã phát triển hiện đại nhưng những hủ tục tinh thần này vẫn tồn tại là do tính chất gì của ý thức xã hội?",
    answerText: "LẠC HẬU",
    correctOptionId: "2",
    options: [
      { id: "1", text: "Vượt trước tồn tại xã hội" },
      { id: "2", text: "Lạc hậu hơn tồn tại xã hội" },
      { id: "3", text: "Có tính kế thừa" },
      { id: "4", text: "Mang tính giai cấp" },
    ],
    promptImage: "/images/hu-tuc-lac-hau.png",
    explanation:
      "Ý thức xã hội thường lạc hậu hơn tồn tại xã hội do sức mạnh của thói quen, tập quán và tính bảo thủ của các hình thái ý thức.",
  },
  {
    answerAscii: "TONTAIXAHOI",
    wordLength: 11,
    colOffset: 11,
    difficulty: "medium",
    points: 20,
    questionText:
      "Những điều kiện sinh hoạt vật chất như địa lý, sông ngòi, bão lũ này tạo nên phạm trù nào quyết định tâm lý dân tộc?",
    answerText: "TỒN TẠI XÃ HỘI",
    correctOptionId: "3",
    options: [
      { id: "1", text: "Ý thức xã hội" },
      { id: "2", text: "Kiến trúc thượng tầng" },
      { id: "3", text: "Tồn tại xã hội" },
      { id: "4", text: "Lực lượng sản xuất" },
    ],
    promptImage: "/images/ban-do-viet-nam.png",
    explanation:
      "Tồn tại xã hội là toàn bộ sinh hoạt vật chất và điều kiện sinh hoạt vật chất của xã hội, bao gồm hoàn cảnh địa lý, dân số và phương thức sản xuất.",
  },
  {
    answerAscii: "DANSO",
    wordLength: 5,
    colOffset: 10,
    difficulty: "easy",
    points: 10,
    questionText:
      "Ngoài hoàn cảnh địa lý và phương thức sản xuất, yếu tố nào của tồn tại xã hội đóng vai trò là nguồn lực con người để xây dựng và bảo vệ đất nước?",
    answerText: "DÂN SỐ",
    correctOptionId: "1",
    options: [
      { id: "1", text: "Dân số" },
      { id: "2", text: "Ý thức chính trị" },
      { id: "3", text: "Quan hệ sản xuất" },
      { id: "4", text: "Hệ tư tưởng" },
    ],
    explanation:
      "Dân số và mật độ dân số là một trong ba yếu tố cơ bản của tồn tại xã hội, là lực lượng người trực tiếp tạo ra lịch sử.",
  },
  {
    answerAscii: "GIAICAP",
    wordLength: 7,
    colOffset: 12,
    difficulty: "easy",
    points: 10,
    questionText:
      "Khi xã hội có sự phân chia lợi ích, ý thức xã hội phản ánh địa vị và nguyện vọng của các tầng lớp khác nhau. Đây là tính ... của ý thức xã hội.",
    answerText: "GIAI CẤP",
    correctOptionId: "4",
    options: [
      { id: "1", text: "Kế thừa" },
      { id: "2", text: "Lạc hậu" },
      { id: "3", text: "Vượt trước" },
      { id: "4", text: "Giai cấp" },
    ],
    explanation:
      "Trong xã hội có giai cấp, ý thức xã hội mang tính giai cấp vì các giai cấp khác nhau có điều kiện vật chất và lợi ích khác nhau.",
  },
  {
    answerAscii: "YTHUCXAHOI",
    wordLength: 10,
    colOffset: 12,
    difficulty: "medium",
    points: 20,
    questionText:
      "Những tình cảm, niềm tin và truyền thống đùm bọc lẫn nhau trong thời kỳ COVID-19 này được gọi chung là gì?",
    answerText: "Ý THỨC XÃ HỘI",
    correctOptionId: "2",
    options: [
      { id: "1", text: "Tồn tại xã hội" },
      { id: "2", text: "Ý thức xã hội" },
      { id: "3", text: "Kiến trúc thượng tầng" },
      { id: "4", text: "Hệ tư tưởng" },
    ],
    promptImage: "/images/ho-tro-covid.png",
    explanation:
      "Ý thức xã hội là mặt tinh thần của đời sống xã hội, bao gồm tâm lý xã hội và hệ tư tưởng, phản ánh tồn tại xã hội.",
  },
  {
    answerAscii: "KETHUA",
    wordLength: 6,
    colOffset: 11,
    difficulty: "hard",
    points: 30,
    questionText:
      "Truyền thống yêu nước được truyền từ đời này sang đời khác, tạo nên sức mạnh xuyên suốt hàng nghìn năm lịch sử. Điều này minh chứng cho tính chất gì của ý thức xã hội?",
    answerText: "KẾ THỪA",
    correctOptionId: "3",
    options: [
      { id: "1", text: "Lạc hậu" },
      { id: "2", text: "Giai cấp" },
      { id: "3", text: "Kế thừa" },
      { id: "4", text: "Vượt trước" },
    ],
    explanation:
      "Tính kế thừa của ý thức xã hội thể hiện ở chỗ các tư tưởng, giá trị văn hóa được truyền và phát triển qua các thế hệ.",
  },
  {
    answerAscii: "PHUONGTHUCSANXUAT",
    wordLength: 17,
    colOffset: 10,
    difficulty: "medium",
    points: 20,
    questionText:
      "Đây là yếu tố cơ bản nhất của tồn tại xã hội, quy định nên lối sống trọng tình nghĩa và tính cộng đồng của người Việt?",
    answerText: "PHƯƠNG THỨC SẢN XUẤT",
    correctOptionId: "1",
    options: [
      { id: "1", text: "Phương thức sản xuất" },
      { id: "2", text: "Điều kiện tự nhiên" },
      { id: "3", text: "Dân số" },
      { id: "4", text: "Truyền thống văn hóa" },
    ],
    promptImage: "/images/canh-tac-lua-nuoc.jpg",
    explanation:
      "Phương thức sản xuất vật chất là yếu tố cơ bản nhất của tồn tại xã hội, quyết định toàn bộ các quan hệ xã hội và ý thức xã hội.",
  },
  {
    answerAscii: "QUYETDINH",
    wordLength: 9,
    colOffset: 5,
    difficulty: "easy",
    points: 10,
    questionText:
      "Điền vào chỗ trống: Theo triết học Mác - Lênin, đời sống vật chất (tồn tại xã hội) đóng vai trò _______ đời sống tinh thần (ý thức xã hội).",
    answerText: "QUYẾT ĐỊNH",
    correctOptionId: "2",
    options: [
      { id: "1", text: "Phản ánh" },
      { id: "2", text: "Quyết định" },
      { id: "3", text: "Bị quyết định bởi" },
      { id: "4", text: "Độc lập với" },
    ],
    explanation:
      "Quy luật cơ bản: tồn tại xã hội quyết định ý thức xã hội. Tuy nhiên ý thức xã hội có tính độc lập tương đối và tác động trở lại.",
  },
  {
    answerAscii: "VUOTTRUOC",
    wordLength: 9,
    colOffset: 11,
    difficulty: "medium",
    points: 20,
    questionText:
      "Những tư tưởng cứu nước của Chủ tịch Hồ Chí Minh có khả năng dự báo xu hướng lịch sử khi tồn tại xã hội chưa biến đổi hết là do tính chất gì của ý thức xã hội?",
    answerText: "VƯỢT TRƯỚC",
    correctOptionId: "4",
    options: [
      { id: "1", text: "Lạc hậu" },
      { id: "2", text: "Kế thừa" },
      { id: "3", text: "Giai cấp" },
      { id: "4", text: "Vượt trước" },
    ],
    explanation:
      "Ý thức xã hội có thể vượt trước tồn tại xã hội khi phản ánh đúng quy luật khách quan, từ đó dự báo và định hướng tương lai.",
  },
  {
    answerAscii: "TACDONGTROLAI",
    wordLength: 13,
    colOffset: 8,
    difficulty: "hard",
    points: 30,
    questionText:
      "Lòng yêu nước, một hình thái ý thức tinh thần, đã biến thành sức mạnh vật chất đánh bại vũ khí hiện đại trong chiến dịch này. Đây là sự ... của ý thức xã hội.",
    answerText: "TÁC ĐỘNG TRỞ LẠI",
    correctOptionId: "1",
    options: [
      { id: "1", text: "Tác động trở lại" },
      { id: "2", text: "Lạc hậu so với" },
      { id: "3", text: "Quyết định" },
      { id: "4", text: "Kế thừa từ" },
    ],
    promptImage: "/images/dien-bien-phu.png",
    explanation:
      "Ý thức xã hội như lòng yêu nước và ý chí chiến đấu tác động trở lại tồn tại xã hội khi trở thành động lực vật chất, sức mạnh tổ chức và hành động.",
  },
  {
    answerAscii: "BIENCHUNG",
    wordLength: 9,
    colOffset: 8,
    difficulty: "hard",
    points: 30,
    questionText:
      "Mối quan hệ tương tác hai chiều, không tách rời giữa vật chất (tồn tại xã hội) và tinh thần (ý thức xã hội) được gọi là mối quan hệ gì?",
    answerText: "BIỆN CHỨNG",
    correctOptionId: "3",
    options: [
      { id: "1", text: "Nhân quả" },
      { id: "2", text: "Siêu hình" },
      { id: "3", text: "Biện chứng" },
      { id: "4", text: "Tất định" },
    ],
    explanation:
      "Mối quan hệ biện chứng: tồn tại xã hội quyết định ý thức xã hội, nhưng ý thức xã hội có tính độc lập tương đối và tác động trở lại tồn tại xã hội.",
  },
];

export const CASE_STUDY_SUMMARY =
  "Lòng yêu nước là một hình thái ý thức xã hội: nó phản ánh điều kiện sinh tồn, lịch sử dựng nước và giữ nước của dân tộc, đồng thời trở thành sức mạnh tinh thần định hướng hành động, tổ chức cộng đồng và tác động trở lại đời sống vật chất.";
