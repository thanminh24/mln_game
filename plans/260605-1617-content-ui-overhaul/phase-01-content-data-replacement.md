---
phase: 1
title: "Content Data Replacement"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Content Data Replacement

## Overview

Replace both `client/src/data/game-data.ts` and `server/src/game/game-data.ts` with the
11-row LÒNG YÊU NƯỚC dataset. Copy the 5 extracted prompt images from `extracted_images/`
into `client/public/images/` with descriptive names.

## Grid Math Reference

Constants (unchanged in Phase 2 grid component):
- `TOTAL_COLS = 30`
- `KEYWORD_COL = 12`
- `KEYWORD_ASCII = "LONGYEUNUOC"`

Verification rule: `answerAscii[KEYWORD_COL - colOffset]` must equal the matching `KEYWORD_ASCII` letter for each row.
The grid displays ASCII cells for projector clarity; headings, answer text, and summary copy display Vietnamese accents.

| # | Vertical | Answer | answerAscii | wordLength | colOffset | promptImage |
|---|---|---|---|---|---|---|
| 1 | L | LẠC HẬU | LACHAU | 6 | 12 | /images/hu-tuc-lac-hau.png |
| 2 | O | TỒN TẠI XÃ HỘI | TONTAIXAHOI | 11 | 11 | /images/ban-do-viet-nam.png |
| 3 | N | DÂN SỐ | DANSO | 5 | 10 | — |
| 4 | G | GIAI CẤP | GIAICAP | 7 | 12 | — |
| 5 | Y | Ý THỨC XÃ HỘI | YTHUCXAHOI | 10 | 12 | /images/ho-tro-covid.png |
| 6 | E | KẾ THỪA | KETHUA | 6 | 11 | — |
| 7 | U | PHƯƠNG THỨC SẢN XUẤT | PHUONGTHUCSANXUAT | 17 | 10 | /images/canh-tac-lua-nuoc.jpg |
| 8 | N | QUYẾT ĐỊNH | QUYETDINH | 9 | 5 | — |
| 9 | U | VƯỢT TRƯỚC | VUOTTRUOC | 9 | 11 | — |
| 10 | O | TÁC ĐỘNG TRỞ LẠI | TACDONGTROLAI | 13 | 8 | /images/dien-bien-phu.png |
| 11 | C | BIỆN CHỨNG | BIENCHUNG | 9 | 8 | — |

## Image File Mapping

Source (from docx extraction) → Destination:
- `extracted_images/image3.png` → `client/public/images/hu-tuc-lac-hau.png`
- `extracted_images/image1.png` → `client/public/images/ban-do-viet-nam.png`
- `extracted_images/image5.png` → `client/public/images/ho-tro-covid.png`
- `extracted_images/image2.jpg` → `client/public/images/canh-tac-lua-nuoc.jpg`
- `extracted_images/image4.png` → `client/public/images/dien-bien-phu.png`

## Related Code Files

- Modify: `client/src/data/game-data.ts`
- Modify: `server/src/game/game-data.ts`
- Create dir: `client/public/images/`
- Copy: 5 image files as listed above
- Delete: `extracted_images/` directory after copy

## Implementation Steps

1. `mkdir -p client/public/images`
2. Copy and rename all 5 images (see mapping above)
3. Delete `extracted_images/` dir
4. Rewrite `client/src/data/game-data.ts`:
   - `KEYWORD = "LÒNG YÊU NƯỚC"`
   - Replace `CROSSWORD_ROWS` array with 11 rows (full data below)
   - Update `CASE_STUDY_SUMMARY`
5. Rewrite `server/src/game/game-data.ts` — identical content to client file
6. Run `npm run build` from root to verify no TypeScript errors

## Full Row Data (for both files)

```ts
export const KEYWORD = "LÒNG YÊU NƯỚC";
export const KEYWORD_ASCII = "LONGYEUNUOC";

export const CROSSWORD_ROWS: CrosswordRow[] = [
  {
    answerAscii: "LACHAU",
    wordLength: 6,
    colOffset: 12,
    questionText: "Dù đời sống vật chất đã phát triển hiện đại nhưng những hủ tục tinh thần này vẫn tồn tại là do tính chất gì của ý thức xã hội?",
    answerText: "LẠC HẬU",
    correctOptionId: "2",
    options: [
      { id: "1", text: "Vượt trước tồn tại xã hội" },
      { id: "2", text: "Lạc hậu hơn tồn tại xã hội" },
      { id: "3", text: "Có tính kế thừa" },
      { id: "4", text: "Mang tính giai cấp" },
    ],
    promptImage: "/images/hu-tuc-lac-hau.png",
    explanation: "Ý thức xã hội thường lạc hậu hơn tồn tại xã hội do sức mạnh của thói quen, tập quán và tính bảo thủ của các hình thái ý thức.",
  },
  {
    answerAscii: "TONTAIXAHOI",
    wordLength: 11,
    colOffset: 11,
    questionText: "Những điều kiện sinh hoạt vật chất như địa lý, sông ngòi, bão lũ này tạo nên phạm trù nào quyết định tâm lý dân tộc?",
    answerText: "TỒN TẠI XÃ HỘI",
    correctOptionId: "3",
    options: [
      { id: "1", text: "Ý thức xã hội" },
      { id: "2", text: "Kiến trúc thượng tầng" },
      { id: "3", text: "Tồn tại xã hội" },
      { id: "4", text: "Lực lượng sản xuất" },
    ],
    promptImage: "/images/ban-do-viet-nam.png",
    explanation: "Tồn tại xã hội là toàn bộ sinh hoạt vật chất và điều kiện sinh hoạt vật chất của xã hội — bao gồm hoàn cảnh địa lý, dân số và phương thức sản xuất.",
  },
  {
    answerAscii: "DANSO",
    wordLength: 5,
    colOffset: 10,
    questionText: "Ngoài hoàn cảnh địa lý và phương thức sản xuất, yếu tố nào của tồn tại xã hội đóng vai trò là nguồn lực con người để xây dựng và bảo vệ đất nước?",
    answerText: "DÂN SỐ",
    correctOptionId: "1",
    options: [
      { id: "1", text: "Dân số" },
      { id: "2", text: "Ý thức chính trị" },
      { id: "3", text: "Quan hệ sản xuất" },
      { id: "4", text: "Hệ tư tưởng" },
    ],
    explanation: "Dân số và mật độ dân số là một trong ba yếu tố cơ bản của tồn tại xã hội, là lực lượng người trực tiếp tạo ra lịch sử.",
  },
  {
    answerAscii: "GIAICAP",
    wordLength: 7,
    colOffset: 12,
    questionText: "Khi xã hội có sự phân chia lợi ích, ý thức xã hội phản ánh địa vị và nguyện vọng của các tầng lớp khác nhau. Đây là tính ... của ý thức xã hội.",
    answerText: "GIAI CẤP",
    correctOptionId: "4",
    options: [
      { id: "1", text: "Kế thừa" },
      { id: "2", text: "Lạc hậu" },
      { id: "3", text: "Vượt trước" },
      { id: "4", text: "Giai cấp" },
    ],
    explanation: "Trong xã hội có giai cấp, ý thức xã hội mang tính giai cấp vì các giai cấp khác nhau có điều kiện vật chất và lợi ích khác nhau.",
  },
  {
    answerAscii: "YTHUCXAHOI",
    wordLength: 10,
    colOffset: 12,
    questionText: "Những tình cảm, niềm tin và truyền thống đùm bọc lẫn nhau trong thời kỳ COVID-19 này được gọi chung là gì?",
    answerText: "Ý THỨC XÃ HỘI",
    correctOptionId: "2",
    options: [
      { id: "1", text: "Tồn tại xã hội" },
      { id: "2", text: "Ý thức xã hội" },
      { id: "3", text: "Kiến trúc thượng tầng" },
      { id: "4", text: "Hệ tư tưởng" },
    ],
    promptImage: "/images/ho-tro-covid.png",
    explanation: "Ý thức xã hội là mặt tinh thần của đời sống xã hội, bao gồm tâm lý xã hội và hệ tư tưởng — phản ánh tồn tại xã hội.",
  },
  {
    answerAscii: "KETHUA",
    wordLength: 6,
    colOffset: 11,
    questionText: "Truyền thống yêu nước được truyền từ đời này sang đời khác, tạo nên sức mạnh xuyên suốt hàng nghìn năm lịch sử. Điều này minh chứng cho tính chất gì của ý thức xã hội?",
    answerText: "KẾ THỪA",
    correctOptionId: "3",
    options: [
      { id: "1", text: "Lạc hậu" },
      { id: "2", text: "Giai cấp" },
      { id: "3", text: "Kế thừa" },
      { id: "4", text: "Vượt trước" },
    ],
    explanation: "Tính kế thừa của ý thức xã hội thể hiện ở chỗ các tư tưởng, giá trị văn hóa được truyền và phát triển qua các thế hệ.",
  },
  {
    answerAscii: "PHUONGTHUCSANXUAT",
    wordLength: 17,
    colOffset: 10,
    questionText: "Đây là yếu tố cơ bản nhất của tồn tại xã hội, quy định nên lối sống trọng tình nghĩa và tính cộng đồng của người Việt?",
    answerText: "PHƯƠNG THỨC SẢN XUẤT",
    correctOptionId: "1",
    options: [
      { id: "1", text: "Phương thức sản xuất" },
      { id: "2", text: "Điều kiện tự nhiên" },
      { id: "3", text: "Dân số" },
      { id: "4", text: "Truyền thống văn hóa" },
    ],
    promptImage: "/images/canh-tac-lua-nuoc.jpg",
    explanation: "Phương thức sản xuất vật chất là yếu tố cơ bản nhất của tồn tại xã hội, quyết định toàn bộ các quan hệ xã hội và ý thức xã hội.",
  },
  {
    answerAscii: "QUYETDINH",
    wordLength: 9,
    colOffset: 5,
    questionText: "Điền vào chỗ trống: Theo triết học Mác - Lênin, đời sống vật chất (tồn tại xã hội) đóng vai trò _______ đời sống tinh thần (ý thức xã hội).",
    answerText: "QUYẾT ĐỊNH",
    correctOptionId: "2",
    options: [
      { id: "1", text: "Phản ánh" },
      { id: "2", text: "Quyết định" },
      { id: "3", text: "Bị quyết định bởi" },
      { id: "4", text: "Độc lập với" },
    ],
    explanation: "Quy luật cơ bản: tồn tại xã hội quyết định ý thức xã hội. Tuy nhiên ý thức xã hội có tính độc lập tương đối và tác động trở lại.",
  },
  {
    answerAscii: "VUOTTRUOC",
    wordLength: 9,
    colOffset: 11,
    questionText: "Những tư tưởng cứu nước của Chủ tịch Hồ Chí Minh có khả năng dự báo xu hướng lịch sử khi tồn tại xã hội chưa biến đổi hết là do tính chất gì của ý thức xã hội?",
    answerText: "VƯỢT TRƯỚC",
    correctOptionId: "4",
    options: [
      { id: "1", text: "Lạc hậu" },
      { id: "2", text: "Kế thừa" },
      { id: "3", text: "Giai cấp" },
      { id: "4", text: "Vượt trước" },
    ],
    explanation: "Ý thức xã hội có thể vượt trước tồn tại xã hội khi phản ánh đúng quy luật khách quan, từ đó dự báo và định hướng tương lai.",
  },
  {
    answerAscii: "TACDONGTROLAI",
    wordLength: 13,
    colOffset: 8,
    questionText: "Lòng yêu nước — một hình thái ý thức tinh thần — đã biến thành sức mạnh vật chất đánh bại vũ khí hiện đại trong chiến dịch này. Đây là sự ... của ý thức xã hội.",
    answerText: "TÁC ĐỘNG TRỞ LẠI",
    correctOptionId: "1",
    options: [
      { id: "1", text: "Tác động trở lại" },
      { id: "2", text: "Lạc hậu so với" },
      { id: "3", text: "Quyết định" },
      { id: "4", text: "Kế thừa từ" },
    ],
    promptImage: "/images/dien-bien-phu.png",
    explanation: "Ý thức xã hội (lòng yêu nước, ý chí chiến đấu) tác động trở lại tồn tại xã hội khi nó trở thành động lực vật chất — sức mạnh tổ chức và hành động.",
  },
  {
    answerAscii: "BIENCHUNG",
    wordLength: 9,
    colOffset: 8,
    questionText: "Mối quan hệ tương tác hai chiều, không tách rời giữa vật chất (tồn tại xã hội) và tinh thần (ý thức xã hội) được gọi là mối quan hệ gì?",
    answerText: "BIỆN CHỨNG",
    correctOptionId: "3",
    options: [
      { id: "1", text: "Nhân quả" },
      { id: "2", text: "Siêu hình" },
      { id: "3", text: "Biện chứng" },
      { id: "4", text: "Tất định" },
    ],
    explanation: "Mối quan hệ biện chứng: tồn tại xã hội quyết định ý thức xã hội, nhưng ý thức xã hội có tính độc lập tương đối và tác động trở lại tồn tại xã hội.",
  },
];

export const CASE_STUDY_SUMMARY =
  "Lòng yêu nước — một hình thái ý thức xã hội — không chỉ phản ánh tồn tại xã hội mà còn trở thành sức mạnh tinh thần định hướng hành động, tổ chức cộng đồng và tác động trở lại đời sống vật chất. Đó chính là biểu hiện sinh động nhất của mối quan hệ biện chứng giữa tồn tại xã hội và ý thức xã hội trong lịch sử dân tộc Việt Nam.";
```

## Success Criteria

- [x] `client/public/images/` contains all 5 renamed images
- [x] `extracted_images/` deleted
- [x] Both `game-data.ts` files have 11 rows, KEYWORD = "LÒNG YÊU NƯỚC"
- [x] Both `game-data.ts` files export `KEYWORD_ASCII = "LONGYEUNUOC"`
- [x] `npm run build` passes with 0 TypeScript errors
- [x] Grid math check: for each row, `answerAscii[KEYWORD_COL - colOffset]` produces correct `KEYWORD_ASCII` letter

## Risk Assessment

Low. Pure data replacement — no logic changes. Only risk is answerAscii/colOffset miscalculation;
verify it mechanically during implementation.
