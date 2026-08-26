# Spec: Làm lại UX cho người mới (Newcomer UX Redesign)

- **Ngày:** 2026-08-26
- **Phạm vi:** Frontend `education_fe` (LinguaAI)
- **Mục tiêu:** Giảm cảm giác bối rối cho người dùng mới bằng cách (1) tự kích hoạt onboarding lần đầu, (2) thống nhất một điểm vào duy nhất, (3) rút gọn thanh điều hướng. Không đổi backend/API.

## 1. Bối cảnh & vấn đề đang có

Khảo sát luồng người dùng hiện tại cho thấy 3 vấn đề chính với người mới:

1. **Onboarding không bao giờ tự chạy.** Sau **đăng ký** (`Register.tsx:52`), **đăng nhập** (`Login.tsx:46`), và **Google OAuth** (`GoogleCallback.tsx:42`) đều `navigate('/education')` — người dùng mới rơi thẳng vào trang trống, chưa cá nhân hoá. Onboarding 5 bước tại `/onboarding` (`Onboarding.tsx`) chỉ truy cập qua đường link thủ công, không code nào tự dẫn tới.
2. **Hai "trang chủ" trùng lặp.** `/education` ("Hôm nay học gì?") và `/today` ("Kế hoạch học hôm nay") gần giống nhau, dùng 2 nguồn API khác nhau (`getTodayPlan` vs `getTodayLearningHub`) khiến người dùng không biết đâu là điểm vào chuẩn.
3. **Sidebar quá tải.** 7 mục "Học tập" cùng lúc (trong đó "Tài liệu" thực chất là Document Import — tính năng nâng cao) cộng Premium + Cài đặt, gây choáng cho người mới.

## 2. Mục tiêu (thành công)

- 100% user mới **hoàn tất hoặc bỏ qua** onboarding ngay đợt đầu sau khi đăng ký.
- Có **một** điểm vào rõ ràng cho user đã đăng nhập: `/today`.
- Sidebar hiển thị ít mục hơn giúp người mới điều hướng dễ hơn, nhưng vẫn giữ đủ tính năng (mục nâng cao gom trong nhóm "Khác").

## 3. Thiết kế

### 3.1 Tự kích hoạt Onboarding lần đầu

**Trigger và redirect:**

| Trường hợp | Hành vi hiện tại | Hành vi mới |
|---|---|---|
| Đăng ký thành công (`Register.tsx:52`) | `navigate('/education')` | `navigate('/onboarding')` |
| Google OAuth (callback) — **chưa** có bản ghi onboarding | `navigate('/education')` | `navigate('/onboarding')` |
| Google OAuth — đã có bản ghi onboarding | `navigate('/education')` | `navigate('/today')` |
| Đăng nhập thường — chưa có bản ghi onboarding | `navigate('/education')` | `navigate('/onboarding')` |
| Đăng nhập thường — đã có bản ghi | `navigate('/education')` | `navigate('/today')` |
| Hoàn tất / "Bỏ qua" onboarding | `navigate('/education')` | `navigate('/today')` |

- Cờ "đã onboarding" = key `edupro-onboarding` tồn tại trong `localStorage` (key đã có sẵn tại `Onboarding.tsx:31`).
- Viết 1 helper nhỏ `isOnboarded()` ở `Onboarding.tsx` (hoặc `utils`) để dùng chung.

**Banner gợi ý "Cá nhân hoá lộ trình":**
- Trên trang chủ `/today`, nếu user đã đăng nhập nhưng **chưa** có `edupro-onboarding`, hiện banner nhỏ có thể đóng: "Cá nhân hoá lộ trình của bạn" → click vào `/onboarding`.
- Trạng thái đóng banner lưu bằng key localStorage riêng (ví dụ `edupro-onboarding-dismissed`).
- Sau khi hoàn tất/bỏ qua onboarding, banner không còn hiện (vì `edupro-onboarding` đã tồn tại).

### 3.2 Một điểm vào duy nhất — "Hôm nay" (`/today`)

- `/today` trở thành **trang chủ sau đăng nhập** và **đích của logo sidebar**.
- `/today` giữ nguyên nội dung hiện tại (dựa trên `TodayLearningHub` — giàu thông tin: mục tiêu phút, XP, streak) và **bổ sung** thêm phần "Lộ trình học" + "Thư viện khóa học" lấy từ trang `/education` để người dùng có đủ hướng đi tiếp mà không cần đổi trang.
- `/education` đổi vai trò thành trang **Khóa học / Lộ trình** (giữ nguyên bảng khóa học + learning path hiện có tại `Education.tsx`).
- Điểm vào của user chưa/không có plan: hiển thị trạng thái rỗng rõ ràng kèm CTA đăng ký khóa học.

**Ghi chú định tuyến:**
- `/today` đã được bọc `ProtectedRoute`.
- Giữ route `/education` nguyên vẹn (chỉ đổi tiêu đề/nhãn điều hướng), không xoá file — giảm rủi ro phá vỡ link cũ (landing, course detail vẫn trỏ về `/education`).

### 3.3 Sidebar rút gọn theo lộ trình

Cập nhật `navConfig.tsx` (`src/components/layout/navConfig.tsx`) và logo target trong `Sidebar.tsx`:

- **Nhóm "Học hôm nay"** (mục cốt lõi):
  - `Hôm nay` → `/today`
  - `Khóa học` → `/education` (`?view=courses` giữ matcher hiện tại)
  - `Flashcards` → `/flashcards`
  - `Quiz` → `/quiz`
- **Nhóm "Khác"** (mục nâng cao, thu vào nhóm xổ xuống):
  - `Coach` → `/learning-coach`
  - `AI Tutor` → `/ai-tutor`
  - `Nhập tài liệu` (đổi nhãn từ `Tài liệu`) → `/flashcards/document-import`
  - `Tiến độ` → `/quiz/stats`
  - `Premium` → `/premium` (giữ ở nhóm "Tài khoản" nếu hợp lý)
  - `Cài đặt` → `/settings` (giữ ở nhóm "Tài khoản")
- **Logo** (`SidebarLogo`) trỏ `/education` → `/today`.
- Nhãn `Tài liệu` → `Nhập tài liệu` để gợi rõ đây là tính năng nâng cao.
- Trạng thái `isSidebarOpen` / collapsed, mobile drawer, và user footer giữ nguyên logic.

> Giai đoạn 1: chỉ gom nhóm "Khác" lại làm nhóm xổ xuống. **Chưa** thực hiện cơ chế "tự mở rộng dần theo tương tác" (ghi chú cho giai đoạn sau, tránh ôm việc).

## 4. Kiến trúc & dữ liệu

- **Không thay đổi backend/API.** 
- Nguyên tắc: ưu tiên sửa `navigate()` và điều hướng, tái sử dụng component/trang sẵn có.
- Helper mới: `isOnboarded()` đọc `localStorage['edupro-onboarding']`.
- Banner state: `localStorage` đơn giản, không thêm store.

## 5. Xử lý lỗi / trạng thái rìa

- **Onboarding sau đăng ký thất bại:** không chặn user; `navigate('/onboarding')` luôn hoạt động. Nếu `/onboarding` bị lỗi render, user vẫn có thể thao tác trang `/today` (route không cứng).
- **Google OAuth không cho biết user mới hay cũ một cách trực tiếp:** dùng `localStorage['edupro-onboarding']` làm proxy. Người dùng cũ chưa từng onboarding sẽ được đưa vào onboarding — hành vi mong muốn.
- **Bỏ qua onboarding:** vẫn ghi `edupro-onboarding` (với payload đánh dấu đã bỏ qua). Điều này tránh mỗi lần đăng nhập sau bị dẫn vào lại wizard. Banner "Cá nhân hoá lộ trình" trên `/today` chỉ hiển thị khi **hoàn toàn chưa có** `edupro-onboarding`.
- **Plugin mỗi trang:** sau redirect, nếu user chưa onboard nhưng đóng banner → không tự điều hướng (tránh khó chịu).

## 6. Kiểm thử

- Cập nhật/bổ sung test cho luồng redirect:
  - Register tạo user → redirect `/onboarding`.
  - Login (chưa onboard) → `/onboarding`; login (đã onboard) → `/today`.
  - GoogleCallback (đã onboard) → `/today`.
  - Hoàn tất onboarding → `/today`.
- Test nav config: nhóm "Học hôm nay" chỉ chứa 4 mục; nhóm "Khác" chứa các mục nâng cao; label "Nhập tài liệu".
- Chạy: `npm run test` (frontend), `npm run lint`, `npm run build`.

## 7. Ngoài phạm vi (Giai đoạn sau)

- Cơ chế tự mở rộng nhóm "Khác" theo mức độ tương tác/thời gian dùng.
- Chặn URL `/education` ở mức route khi user chưa đăng nhập (giữ hiện tại để được đơn giản, chỉ cải thiện trạng thái rỗng).
- Onboarding tích hợp backend (lưu preference thật thay vì localStorage).