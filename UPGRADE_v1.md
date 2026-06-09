# 🚀 English Quizzer — Kế hoạch & Tiến độ Nâng cấp v1.0

> File này theo dõi toàn bộ kế hoạch, quyết định kỹ thuật, và tiến độ cho đợt nâng cấp lớn:
> thêm hệ thống user, auth, dashboard, và AI import câu hỏi.
>
> **Trạng thái hiện tại:** ✅ Giai đoạn 1-5 hoàn thành — app đang chạy production
> **Cập nhật lần cuối:** 2026-06-09

---

## 📌 Tóm tắt nâng cấp

| Hạng mục | Trước (v0.3) | Sau (v1.0) |
|---|---|---|
| Auth | Không có | Email/password qua Supabase |
| Dữ liệu câu hỏi | File JSON tĩnh | Supabase PostgreSQL |
| Kết quả thi | localStorage | localStorage (guest) + Supabase (user) |
| Vai trò | Không có | `guest`, `student`, `admin` |
| Dashboard | Không có | Student dashboard + Admin dashboard |
| Thêm câu hỏi | Sửa JSON thủ công | Admin upload tài liệu → AI tạo → duyệt → lưu DB |

---

## ✅ Tiến độ thực hiện

### Giai đoạn 1 — Nền tảng Auth + DB ✅ HOÀN THÀNH
- [x] Tạo Supabase project
- [x] Tạo file `.env` với `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`
- [x] Cài `@supabase/supabase-js`
- [x] `src/utils/supabase.js` — init client
- [x] `src/context/AuthContext.jsx` — global auth state (user + profile + loading)
- [x] `src/components/ProtectedRoute.jsx` — route guard theo role
- [x] `src/components/Navbar.jsx` — top bar có avatar + dropdown menu
- [x] `src/pages/Login.jsx` — tab đăng nhập / đăng ký
- [x] `src/utils/auth.js` — signIn, signUp, signOut, getProfile helpers
- [x] Cập nhật `App.jsx` — AuthProvider + 8 routes mới
- [x] SQL migration `001_profiles.sql` — bảng profiles + trigger tạo profile tự động
- [x] Fix RLS policy cho profiles (recursive policy issue)
- [x] Test: đăng ký → login → logout → admin role hoạt động

**Vấn đề gặp phải & cách fix:**
- Lỗi "Database error saving new user" → do trigger function lỗi, fix bằng `001_profiles_fix.sql`
- Profile load là `student` dù đã update → do RLS policy chặn đọc, fix bằng policy đơn giản hơn
- Sau fix: logout → login lại để reload profile từ DB

---

### Giai đoạn 2 — Questions lên DB ✅ HOÀN THÀNH
- [x] SQL migration `002_questions.sql` — bảng questions + RLS
- [x] SQL fix `002b_fix_correct_nullable.sql` — cho phép `correct = null` (dạng matching)
- [x] Script `src/scripts/importQuestions.mjs` — import 40 câu từ JSON lên Supabase
- [x] `src/hooks/useQuestions.js` — hook fetch questions + helpers (fetchCurriculums, fetchUnits, fetchRandomQuestions)
- [x] Cập nhật `src/pages/Home.jsx` — fetch từ Supabase, fallback về JSON nếu lỗi
- [x] `normalizeQuestion()` — convert DB row format → component format (spread payload vào root)

**Vấn đề gặp phải & cách fix:**
- Import lỗi RLS khi dùng anon key → dùng `service_role key` trong script (không commit lên git)
- Import lỗi `null value in column "correct"` → `correct` column phải nullable cho dạng matching

**Lưu ý quan trọng:**
- Script dùng `service_role key` — chỉ dùng local, xóa key khỏi file sau khi import
- `payload` jsonb chứa `options`/`word_bank`/`words`/`pairs` tùy type
- `normalizeQuestion()` spread payload vào root để component cũ dùng được không cần sửa

---

### Giai đoạn 3 — Student Dashboard + lưu kết quả server ✅ HOÀN THÀNH
- [x] SQL migration `003_sessions_assignments.sql` — bảng `quiz_sessions` + `assignments` + RLS
- [x] `src/utils/sessions.js` — saveSessionToDB, fetchSessionHistory, fetchUserStats
- [x] Cập nhật `src/pages/Result.jsx` — lưu localStorage (guest) + Supabase (user đăng nhập)
- [x] Cập nhật `src/pages/Quiz.jsx` — truyền `quizMeta` (curriculum/unit) vào Result
- [x] Cập nhật `src/pages/Home.jsx` — truyền `quizMeta` khi navigate
- [x] `src/pages/student/Dashboard.jsx` — stats thật + 3 lần thi gần nhất
- [x] `src/pages/student/MyHistory.jsx` — lịch sử từ Supabase, bấm mở xem chi tiết từng câu

**Vấn đề gặp phải & cách fix:**
- Kết quả bị lưu 2 lần → React StrictMode chạy useEffect 2 lần trong dev
- Fix: dùng `useRef` làm flag `savedRef.current` để đảm bảo chỉ lưu 1 lần

---

### Giai đoạn 4 — Admin Dashboard ✅ HOÀN THÀNH
- [x] `src/pages/admin/Dashboard.jsx` — stats: số câu hỏi, học viên, lần thi + 5 lần thi gần nhất toàn hệ thống
- [x] `src/pages/admin/Students.jsx` — danh sách học viên, xem bài được gán, gán bài mới, xóa bài gán
- [x] `src/pages/admin/Questions.jsx` — xem toàn bộ câu hỏi, filter curriculum/unit/type/search, ẩn/hiện, xóa

**Tính năng Admin Students:**
- Bấm mở từng học viên → xem bài được gán hiện tại
- Form gán bài: chọn curriculum → unit tự load → ghi chú tùy chọn
- Upsert để tránh gán trùng (unique constraint)
- Xóa bài gán bằng nút ✕

**Tính năng Admin Questions:**
- Thống kê breakdown theo type (trắc nghiệm, điền từ, v.v.)
- Filter kết hợp: curriculum + unit + type + text search
- Toggle ẩn/hiện câu (soft delete — giữ trong DB)
- Xóa vĩnh viễn (hard delete)

---

### Giai đoạn 5 — AI Import ✅ HOÀN THÀNH
- [x] `src/utils/aiImport.js` — AI_MODELS, buildPrompt, generateQuestions, checkDuplicate, validateQuestion
- [x] `src/pages/admin/AiImport.jsx` — UI 3 bước: Cấu hình → Tài liệu → Duyệt & Lưu
- [x] Test thành công: import 10 câu hỏi mới từ AI

**Luồng AI Import:**
1. Admin chọn provider + model + paste API key (lưu sessionStorage, không lên server)
2. Chọn curriculum + unit
3. Paste text hoặc upload ảnh tài liệu
4. AI tạo câu hỏi → app validate format + check duplicate với DB
5. Admin tick/bỏ từng câu → lưu vào Supabase

**Models hỗ trợ:**

| Provider | Model | API String | Ghi chú |
|---|---|---|---|
| Gemini | Gemini 2.5 Flash-Lite | `gemini-2.5-flash-lite` | Nhanh, rẻ |
| Gemini | Gemini 2.5 Flash | `gemini-2.5-flash` | Mặc định |
| Gemini | Gemini 3.1 Flash-Lite | `gemini-3.1-flash-lite` | Thế hệ mới |
| Gemini | Gemini 3.1 Flash | `gemini-3.1-flash` | Mạnh nhất |
| DeepSeek | DeepSeek V4 Flash | `deepseek-v4-flash` | Nhanh, rẻ |
| DeepSeek | DeepSeek V4 Pro | `deepseek-v4-pro` | Mạnh hơn |

**Duplicate detection:**
- Lấy tất cả `question` text của curriculum/unit hiện có từ DB
- Tính Levenshtein distance giữa câu mới và từng câu cũ
- Similarity ≥ 80% → đánh dấu ⚠️ (vẫn cho phép lưu nếu admin muốn)

**Validate format:**
- Kiểm tra đủ fields bắt buộc
- `multiple_choice` / `error_correction`: đúng 4 options, correct là number
- `fill_in_blank`: đúng 4 word_bank, correct là string
- `reorder`: ≥2 words, correct là array
- `matching`: đúng 4 pairs

---

### Giai đoạn 6 — Join Request 🔲 CHƯA THỰC HIỆN
- [ ] Bảng `join_requests`
- [ ] Student: form xin tham gia
- [ ] Admin: danh sách pending + approve/reject

---

## 🗄️ Database Schema hiện tại

```
auth.users (Supabase managed)
    │
    ▼
profiles          id, display_name, role, created_at
questions         id, curriculum, unit, type, question, payload, correct,
                  explanation, difficulty, is_active, created_by, created_at
assignments       id, student_id, curriculum, unit, assigned_by, assigned_at, due_date, note
quiz_sessions     id, user_id, curriculum, unit, score, total, pct, answers, played_at
```

### SQL Migrations (theo thứ tự chạy)
| File | Nội dung | Trạng thái |
|---|---|---|
| `001_profiles.sql` | Bảng profiles + trigger | ✅ |
| `001_profiles_fix.sql` | Fix trigger + RLS | ✅ |
| `002_questions.sql` | Bảng questions + RLS | ✅ |
| `002b_fix_correct_nullable.sql` | Fix correct nullable | ✅ |
| `003_sessions_assignments.sql` | Bảng sessions + assignments | ✅ |

---

## 📁 Files mới thêm trong v1.0

```
src/
├── context/
│   └── AuthContext.jsx          ← Global auth state
├── hooks/
│   ├── useQuestions.js          ← Fetch questions từ Supabase
├── utils/
│   ├── supabase.js              ← Supabase client
│   ├── auth.js                  ← signIn/signUp/signOut/getProfile
│   ├── sessions.js              ← saveSessionToDB/fetchHistory/fetchStats
│   └── aiImport.js              ← AI models, prompt, gọi API, validate, duplicate
├── components/
│   ├── ProtectedRoute.jsx       ← Route guard theo role
│   └── Navbar.jsx               ← Top navbar có dropdown menu
├── pages/
│   ├── Login.jsx                ← Đăng nhập / Đăng ký
│   ├── student/
│   │   ├── Dashboard.jsx        ← Stats + recent sessions
│   │   ├── MyHistory.jsx        ← Lịch sử thi từ server
│   │   └── Explore.jsx          ← Placeholder
│   └── admin/
│       ├── Dashboard.jsx        ← Stats + recent all sessions
│       ├── Students.jsx         ← Quản lý học viên + gán bài
│       ├── Questions.jsx        ← CRUD câu hỏi
│       └── AiImport.jsx         ← 3-step AI import UI
└── scripts/
    └── importQuestions.mjs      ← One-time script import JSON → DB
supabase/
├── 001_profiles.sql
├── 001_profiles_fix.sql
├── 002_questions.sql
├── 002b_fix_correct_nullable.sql
└── 003_sessions_assignments.sql
```

---

## ⚙️ Biến môi trường

```env
# .env (không commit lên GitHub)
VITE_SUPABASE_URL=https://jalxcubkfrcjdpyocefb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**API key AI:** KHÔNG lưu trong `.env` — admin paste trực tiếp vào UI mỗi lần dùng, lưu tạm `sessionStorage`.

---

## 🔮 Backlog tiếp theo

### Ưu tiên cao
- [ ] Deploy lên GitHub Pages (cần fix `base` config cho Supabase auth callback)
- [ ] Student dashboard: hiển thị bài được gán từ assignments table
- [ ] Giai đoạn 6: Join Request (học viên xin tham gia, admin duyệt)

### Ưu tiên trung bình
- [ ] Admin: xem lịch sử thi của từng học viên cụ thể
- [ ] Student Explore page: browse toàn bộ câu hỏi theo curriculum/unit
- [ ] PWA support
- [ ] Dark mode

### Ưu tiên thấp
- [ ] Difficulty level filter khi làm bài
- [ ] Biểu đồ tiến độ học tập theo thời gian
- [ ] Text-to-Speech đọc câu hỏi

---

*Cập nhật lần cuối: 2026-06-09 — v1.0 hoàn thành 5/6 giai đoạn*
