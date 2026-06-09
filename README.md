# 📚 English Quizzer — Tài liệu Dự án

> Ứng dụng quiz tiếng Anh dành cho học sinh tiểu học, tối ưu cho điện thoại di động.  
> Tài liệu này mô tả toàn bộ yêu cầu, kiến trúc, quyết định kỹ thuật, và lịch sử phát triển.

---

## 🎯 Mục tiêu dự án

Xây dựng một **web app quiz tiếng Anh** nhẹ nhàng, chạy tốt trên điện thoại, dành cho học sinh tiểu học ôn luyện theo chương trình học. App không cần đăng nhập, không cần backend phức tạp, hoàn toàn miễn phí để vận hành.

---

## 👤 Người dùng mục tiêu

- Học sinh tiểu học (ví dụ: chương trình **SKET8**)
- Phụ huynh hỗ trợ con ôn bài tại nhà
- Sử dụng chủ yếu trên **điện thoại di động**

---

## ✅ Yêu cầu chức năng

### 1. Các dạng bài tập được hỗ trợ

| Dạng bài | Mô tả | Ký hiệu trong JSON |
|---|---|---|
| Trắc nghiệm | Chọn 1 đáp án đúng trong A/B/C/D | `multiple_choice` |
| Điền vào chỗ trống | Chọn từ trong danh sách cho sẵn để điền | `fill_in_blank` |
| Sắp xếp câu | Bấm các từ để xếp thành câu đúng | `reorder` |
| Sửa lỗi sai | Chọn phần sai trong câu và sửa lại | `error_correction` |
| Nối từ với nghĩa | Chọn để nối từ với định nghĩa | `matching` |

> **Lưu ý:** Có thể bổ sung thêm dạng bài mới trong tương lai mà không ảnh hưởng các dạng đã có (nhờ kiến trúc component độc lập).

### 2. Tính năng lọc và random câu hỏi

- Lọc câu hỏi theo **chương trình học** (`curriculum`), ví dụ: SKET8
- Lọc theo **unit/bài** (`unit`), ví dụ: Unit 1
- **Random toàn bộ** nếu không chọn bộ lọc cụ thể
- Người dùng chọn **số lượng câu** mỗi bài thi (5 / 10 / 15 / 20)

### 3. Chống học mẹo (Anti-memorization)

- **Xáo trộn thứ tự đáp án** mỗi lần làm bài (dạng trắc nghiệm, sửa lỗi)
- **Xáo trộn vị trí các từ** hiển thị mỗi lần (dạng sắp xếp câu)
- **Random thứ tự câu hỏi** trong mỗi bài thi
- Thuật toán: **Fisher-Yates shuffle** (`src/utils/shuffle.js`)

### 4. Âm thanh phản hồi ✅ ĐÃ TRIỂN KHAI

Dùng **Web Audio API** — không cần file âm thanh, không cần thư viện thêm.

| Sự kiện | Âm thanh |
|---|---|
| 🚀 Bắt đầu bài | 2 nốt đi lên nhẹ nhàng |
| ✅ Trả lời đúng | 2 nốt vui vẻ (Do – Sol) |
| ❌ Trả lời sai | 1 nốt trầm ngắn |
| 🔗 Nối đúng 1 cặp (Matching) | 2 nốt nhỏ |
| 🔗 Nối sai (Matching) | 1 nốt nhẹ báo sai |
| 🏁 Hoàn thành bình thường | 2 nốt kết thúc |
| 🏆 Hoàn thành 100% | Fanfare 4 nốt ăn mừng |

### 5. Màn hình kết quả ✅ ĐÃ TRIỂN KHAI

- Hiển thị emoji + thông điệp theo % điểm (🏆 🌟 😊 💪 📖)
- Hiển thị **điểm số** và **tỉ lệ % chính xác** + progress bar
- Nút **"🔍 Xem lại từng câu"**: xem lại toàn bộ câu đúng/sai + giải thích
- Nút **"📊 Xem lịch sử các lần thi"**: chuyển sang trang History
- Kết quả được **tự động lưu** vào localStorage sau mỗi lần thi

### 6. Lịch sử thi ✅ ĐÃ TRIỂN KHAI

Trang `/history` lưu và hiển thị tối đa **30 lần thi** gần nhất.

- **Thống kê tổng**: số lần thi, % trung bình, điểm cao nhất
- **Danh sách các lần thi**: emoji kết quả, số câu đúng, %, ngày giờ, mini bar
- **Bấm mở rộng** từng lần → xem chi tiết các câu sai + đáp án đúng + giải thích
- Nút **Xoá tất cả** lịch sử (có xác nhận)
- Nút truy cập từ: trang chủ (khi đã có lịch sử) + màn hình kết quả

### 7. Cập nhật nội dung

- Thêm câu hỏi mới: chỉ cần sửa `src/data/questions.json`, push lên GitHub → app tự cập nhật
- Thêm dạng bài mới: tạo thêm component mới, không ảnh hưởng phần còn lại

---

## 🏗️ Kiến trúc kỹ thuật

### Stack công nghệ

| Thành phần | Công nghệ | Lý do chọn |
|---|---|---|
| Framework | **React 18 + Vite 5** | Phổ biến, nhanh, AI hỗ trợ tốt |
| Routing | **React Router v6** | SPA routing đơn giản |
| Styling | **Tailwind CSS v3** | Mobile-first, responsive dễ dàng |
| Font | **Nunito** (Google Fonts) | Tròn, dễ đọc, phù hợp trẻ em |
| Dữ liệu câu hỏi | **File JSON tĩnh** | Không cần DB, cập nhật đơn giản |
| Âm thanh | **Web Audio API** | Không cần file, không cần thư viện |
| Lưu kết quả | **localStorage** | Không cần server, lưu trên thiết bị |
| Hosting | **GitHub Pages** | Miễn phí, subdomain `*.github.io` |
| Deploy | **GitHub Actions** | Tự động deploy khi push code |

### Tại sao không dùng Database?

- Câu hỏi quiz không thay đổi real-time → file JSON là đủ
- Không cần user login hay đồng bộ dữ liệu giữa các thiết bị
- Không bao giờ hết hạn free tier, không cần quản lý server
- Cập nhật câu hỏi = sửa JSON + push GitHub (đơn giản nhất)

---

## 📁 Cấu trúc thư mục dự án

```
english-quizzer/
├── .github/
│   └── workflows/
│       └── deploy.yml              ← GitHub Actions: tự động build & deploy
├── public/
│   └── favicon.svg
├── src/
│   ├── data/
│   │   └── questions.json          ← Ngân hàng câu hỏi (40 câu SKET8 mẫu)
│   ├── components/
│   │   ├── QuizCard.jsx             ← Wrapper: hiển thị 1 câu + explanation
│   │   ├── MultipleChoice.jsx       ← Dạng: Trắc nghiệm A/B/C/D
│   │   ├── FillInBlank.jsx          ← Dạng: Điền vào chỗ trống
│   │   ├── ReorderSentence.jsx      ← Dạng: Sắp xếp câu (bấm từ)
│   │   ├── ErrorCorrection.jsx      ← Dạng: Sửa lỗi sai
│   │   └── Matching.jsx             ← Dạng: Nối từ với nghĩa
│   ├── pages/
│   │   ├── Home.jsx                 ← Trang chủ: filter + chọn số câu + start
│   │   ├── Quiz.jsx                 ← Trang làm bài + progress bar + live score
│   │   ├── Result.jsx               ← Kết quả + xem lại từng câu
│   │   └── History.jsx              ← Lịch sử các lần thi + thống kê
│   ├── utils/
│   │   ├── shuffle.js               ← Fisher-Yates shuffle + shuffleOptions
│   │   ├── filterQuestions.js       ← Lọc/random câu theo curriculum/unit
│   │   ├── storage.js               ← Đọc/ghi lịch sử thi vào localStorage
│   │   └── sounds.js                ← Web Audio API: âm thanh đúng/sai/kết thúc
│   ├── App.jsx                      ← Router: 4 routes (/ /quiz /result /history)
│   ├── main.jsx
│   └── index.css                    ← Tailwind + custom component classes
├── .gitignore
├── README.md                        ← File này
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 📋 Cấu trúc JSON — Ngân hàng câu hỏi

File: `src/data/questions.json`

### Các trường bắt buộc cho mọi câu hỏi

| Key | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|
| `id` | ✅ | ID duy nhất, tăng dần | `1`, `2`, `3` |
| `curriculum` | ✅ | Chương trình học | `"SKET8"`, `"FRIENDS1"` |
| `unit` | ✅ | Bài/Unit cụ thể | `"Unit 1"`, `"Unit 2"` |
| `type` | ✅ | Dạng bài | Xem bảng dạng bài ở trên |
| `question` | ✅ | Nội dung đề bài | `"She ___ a student."` |
| `explanation` | ✅ | Giải thích đáp án | `"'She' ngôi 3 số ít → 'is'"` |

### Ví dụ từng dạng bài

#### `multiple_choice` — Trắc nghiệm
```json
{
  "id": 1, "curriculum": "SKET8", "unit": "Unit 1",
  "type": "multiple_choice",
  "question": "A rhino is ________ than a monkey.",
  "options": ["big", "bigger", "more big", "biggest"],
  "correct": 1,
  "explanation": "So sánh hơn tính từ ngắn: thêm '-er'. 'big' → 'bigger'."
}
```
> `correct` = **index** của đáp án đúng trong `options` (bắt đầu từ 0)

#### `fill_in_blank` — Điền vào chỗ trống
```json
{
  "id": 2, "curriculum": "SKET8", "unit": "Unit 1",
  "type": "fill_in_blank",
  "question": "A giraffe is ________ than a hippo.",
  "word_bank": ["taller", "faster", "shorter", "slower"],
  "correct": "taller",
  "explanation": "Giraffe cao hơn hippo → 'taller'."
}
```

#### `reorder` — Sắp xếp câu
```json
{
  "id": 3, "curriculum": "SKET8", "unit": "Unit 2",
  "type": "reorder",
  "question": "Sắp xếp thành câu hoàn chỉnh:",
  "words": ["slower", "a hippo", "than", "is", "a tiger"],
  "correct": ["a hippo", "is", "slower", "than", "a tiger"],
  "explanation": "Cấu trúc: Subject + is/are + adj-er + than + Object."
}
```

#### `error_correction` — Sửa lỗi sai
```json
{
  "id": 4, "curriculum": "SKET8", "unit": "Unit 3",
  "type": "error_correction",
  "question": "A snake is more long than a monkey.",
  "options": ["more long → longer", "snake → snakes", "is → are", "than → then"],
  "correct": 0,
  "explanation": "'long' là tính từ ngắn → dùng '-er': 'longer'."
}
```
> `correct` = **index** của đáp án đúng trong `options`

#### `matching` — Nối từ với nghĩa
```json
{
  "id": 5, "curriculum": "SKET8", "unit": "Unit 1",
  "type": "matching",
  "question": "Nối từ với nghĩa đúng:",
  "pairs": [
    { "word": "daughter", "meaning": "con gái" },
    { "word": "son",      "meaning": "con trai" },
    { "word": "parents",  "meaning": "bố mẹ" },
    { "word": "grandparents", "meaning": "ông bà" }
  ],
  "explanation": "daughter=con gái, son=con trai, parents=bố mẹ, grandparents=ông bà."
}
```

---

## 📱 Yêu cầu giao diện (UI/UX)

- **Mobile-first**: Thiết kế ưu tiên màn hình điện thoại (360px–430px), max-width 512px
- Chữ to, dễ đọc, button đủ lớn để bấm bằng ngón tay
- Font **Nunito**: tròn, thân thiện, phù hợp học sinh nhỏ
- Màu chủ đạo: **Blue 600** (`#2563eb`) + accent xanh lá (đúng) / đỏ (sai)
- Hiệu ứng: `animate-bounce-in` khi hiện câu mới, `animate-shake` khi sai
- Progress bar trên cùng hiển thị tiến độ làm bài
- Live score (✅ X / Y) hiển thị trong header khi làm bài
- Không cần đăng nhập, mở app là dùng ngay

---

## 🚀 Quy trình Deploy (GitHub Pages)

### Lần đầu setup
```bash
# 1. Tạo repo GitHub tên: english-quizzer
# 2. Vào Settings → Pages → Source: GitHub Actions
git init
git remote add origin https://github.com/[username]/english-quizzer.git
git add .
git commit -m "first commit"
git push -u origin main
```

### Cập nhật thường ngày
```bash
git add .
git commit -m "thêm câu hỏi Unit 5"
git push
# GitHub Actions tự build & deploy trong ~2 phút
```

### URL sau khi deploy
```
https://[username].github.io/english-quizzer/
```

### Test trên điện thoại (local)
```bash
npm run dev
# Vite tự show địa chỉ Network IP
# Mở địa chỉ đó trên điện thoại (cùng WiFi)
```

---

## 🛠️ Lệnh phát triển

```bash
npm install        # Cài dependencies lần đầu
npm run dev        # Chạy dev server (localhost:5173)
npm run build      # Build production → thư mục dist/
npm run preview    # Preview bản build
```

> **Lưu ý Windows:** Nếu gặp lỗi rollup/esbuild, xoá `node_modules` và `package-lock.json` rồi chạy lại `npm install` (KHÔNG dùng `--ignore-scripts`).

---

## 🗓️ Lịch sử phát triển

### v0.1 — Khởi tạo dự án (2026-06-05)
- ✅ Setup project React + Vite + Tailwind CSS + React Router
- ✅ Cấu trúc thư mục đầy đủ
- ✅ File `questions.json` với 40 câu hỏi mẫu SKET8 Unit 1–4
- ✅ 5 dạng component: `MultipleChoice`, `FillInBlank`, `ReorderSentence`, `ErrorCorrection`, `Matching`
- ✅ Logic Fisher-Yates shuffle + xáo trộn đáp án chống học mẹo
- ✅ Filter theo curriculum / unit + chọn số câu (5/10/15/20)
- ✅ Trang chủ (`Home`), làm bài (`Quiz`), kết quả (`Result`)
- ✅ Progress bar + live score khi làm bài
- ✅ Xem lại từng câu + giải thích sau khi thi
- ✅ GitHub Actions tự động deploy lên GitHub Pages
- ✅ `vite.config.js` cấu hình `host: '0.0.0.0'` để test trên điện thoại qua WiFi

### v0.2 — Thêm âm thanh (2026-06-05)
- ✅ Tạo `src/utils/sounds.js` dùng Web Audio API (không cần file âm thanh)
- ✅ Âm thanh: bắt đầu bài, đúng, sai, nối đúng/sai (Matching), kết thúc bình thường, fanfare 100%
- ✅ Tích hợp vào tất cả 5 component dạng bài

### v0.3 — Lịch sử thi (2026-06-05)
- ✅ Cập nhật `storage.js`: lưu thêm chi tiết `answers` từng câu (tối đa 30 lần)
- ✅ Tạo trang `History.jsx` với thống kê tổng (số lần thi, % TB, điểm cao nhất)
- ✅ Danh sách lần thi: emoji, điểm, %, ngày giờ, mini progress bar
- ✅ Bấm mở rộng từng lần → xem câu sai + đáp án đúng + giải thích
- ✅ Nút Xoá tất cả lịch sử (có xác nhận)
- ✅ Thêm route `/history` vào `App.jsx`
- ✅ Nút truy cập History từ trang chủ + màn hình kết quả

### v1.0 — Hệ thống User + Supabase + AI Import (2026-06-09)
- ✅ **Auth**: Đăng nhập / đăng ký qua Supabase, phân quyền `guest` / `student` / `admin`
- ✅ **Navbar**: Top bar có avatar, dropdown menu, logout
- ✅ **Questions lên DB**: Chuyển 40 câu từ JSON tĩnh → Supabase PostgreSQL
- ✅ **Home fallback**: Tự động dùng JSON offline nếu Supabase không khả dụng
- ✅ **Lưu kết quả server**: User đăng nhập → lưu `quiz_sessions` lên Supabase + hiện ☁️
- ✅ **Student Dashboard**: Stats (lần thi, % TB, điểm cao nhất) + 3 lần thi gần nhất
- ✅ **Student History**: Lịch sử thi từ server, bấm mở xem chi tiết từng câu sai
- ✅ **Admin Dashboard**: Stats toàn hệ thống + 5 lần thi gần nhất của tất cả học viên
- ✅ **Admin Students**: Danh sách học viên, gán bài (curriculum/unit), xóa bài gán
- ✅ **Admin Questions**: Xem/filter/ẩn/xóa toàn bộ câu hỏi trong DB
- ✅ **AI Import**: 3 bước (Cấu hình → Tài liệu → Duyệt & Lưu), hỗ trợ Gemini + DeepSeek
- ✅ **Fix**: useRef chặn lưu 2 lần do React StrictMode

---

## 🔮 Kế hoạch tiếp theo (Backlog)

### Ưu tiên cao
- [ ] Deploy lên GitHub Pages
- [ ] Student dashboard: hiển thị bài được gán từ `assignments` table
- [ ] Giai đoạn 6: Join Request (học viên xin tham gia, admin duyệt)

### Ưu tiên trung bình
- [ ] Admin: xem lịch sử thi của từng học viên cụ thể
- [ ] Student Explore: browse câu hỏi theo curriculum/unit
- [ ] PWA — cài app lên điện thoại như app thật
- [ ] Dark mode

### Ưu tiên thấp / Tương lai
- [ ] Difficulty level filter khi làm bài
- [ ] Biểu đồ tiến độ học tập theo thời gian
- [ ] Text-to-Speech đọc câu hỏi
- [ ] Chế độ thi có đếm ngược thời gian

---

## 📝 Ghi chú kỹ thuật

- Dạng **Đọc hiểu, Viết tự do, Viết câu từ gợi ý** → không phù hợp chấm tự động, bỏ qua
- `localStorage` lưu trên **thiết bị người dùng** → xóa cache/data trình duyệt sẽ mất lịch sử local
- `quiz_sessions` trên Supabase → xem được trên mọi thiết bị khi đăng nhập
- API key AI chỉ trong `sessionStorage` → mất khi đóng tab, không bao giờ lên server
- Khi thêm curriculum mới qua AI Import, filter trang chủ tự cập nhật (không cần sửa code)
- Chi tiết kỹ thuật nâng cấp v1.0: xem file `UPGRADE_v1.md`

---

*Tài liệu cập nhật lần cuối: 2026-06-09 — v1.0*
