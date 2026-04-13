# Hướng dẫn Setup Google Login cho Frontend

## ✅ Frontend đã sẵn sàng!

Frontend đã được tích hợp đầy đủ tính năng đăng nhập Google. **Bạn KHÔNG cần setup gì thêm ở frontend**.

## 📋 Checklist để chạy Google Login

### 1. ✅ Frontend đã có sẵn:
- [x] Nút "Đăng nhập bằng Google" trong Login page
- [x] GoogleCallback page để xử lý tokens (`/auth/callback`)
- [x] Route đã được thêm vào App.tsx
- [x] Tự động lưu tokens vào localStorage và Zustand store
- [x] Auto redirect về dashboard sau khi đăng nhập thành công

### 2. 🔧 Cần setup ở Backend:

**BẮT BUỘC**: Backend phải được setup Google OAuth trước. Xem hướng dẫn tại:
- `../stock-be/GOOGLE_OAUTH_SETUP.md`

Các bước cần làm ở backend:
1. Tạo Google OAuth credentials trong Google Cloud Console
2. Thêm vào `.env` của backend:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   FRONTEND_URL=http://localhost:5173
   ```

### 3. ⚙️ Cấu hình Frontend (Optional):

Chỉ cần tạo file `.env` nếu backend chạy ở URL khác `http://localhost:3000`:

```bash
# Tạo file .env
cd stock-fe
echo "VITE_API_URL=http://localhost:3000" > .env
```

## 🚀 Cách sử dụng

1. **Chạy Backend**:
   ```bash
   cd stock-be
   npm run start:dev
   ```

2. **Chạy Frontend**:
   ```bash
   cd stock-fe
   npm run dev
   ```

3. **Truy cập**: `http://localhost:5173/login`

4. **Click "Đăng nhập bằng Google"** → Chọn tài khoản Google → Tự động vào dashboard ✅

## 🔄 Flow hoạt động

```
User click "Đăng nhập Google"
  ↓
Frontend redirect → Backend: GET /auth/google
  ↓
Backend redirect → Google OAuth
  ↓
User chọn account Google
  ↓
Google redirect → Backend: GET /auth/google/callback
  ↓
Backend tạo/find user → Generate tokens
  ↓
Backend redirect → Frontend: /auth/callback?accessToken=...&refreshToken=...
  ↓
Frontend GoogleCallback page:
  - Nhận tokens từ query params
  - Lưu vào localStorage và Zustand store
  - Redirect → /dashboard ✅
```

## 🐛 Troubleshooting

### Lỗi: "redirect_uri_mismatch"
- **Nguyên nhân**: Backend chưa setup Google OAuth credentials đúng
- **Giải pháp**: Kiểm tra lại `GOOGLE_CALLBACK_URL` trong backend `.env` và Authorized redirect URIs trong Google Cloud Console

### Lỗi: "Cannot connect to backend"
- **Nguyên nhân**: Backend chưa chạy hoặc URL sai
- **Giải pháp**: 
  - Kiểm tra backend đang chạy tại `http://localhost:3000`
  - Hoặc cập nhật `VITE_API_URL` trong frontend `.env`

### Tokens không được lưu
- **Nguyên nhân**: Callback page không nhận được tokens
- **Giải pháp**: 
  - Mở DevTools → Network tab
  - Kiểm tra redirect URL có chứa `accessToken` và `refreshToken` không
  - Kiểm tra console có lỗi gì không

## 📝 Lưu ý

- Frontend **KHÔNG cần** Google Client ID hay Client Secret
- Tất cả OAuth flow được xử lý bởi backend
- Frontend chỉ cần biết URL của backend (`VITE_API_URL`)
- Tokens được lưu tự động và dùng cho các API calls tiếp theo

## ✅ Kết luận

**Frontend đã sẵn sàng 100%!** Chỉ cần:
1. ✅ Backend setup Google OAuth (xem `../stock-be/GOOGLE_OAUTH_SETUP.md`)
2. ✅ Chạy backend và frontend
3. ✅ Click nút Google Login và test!

