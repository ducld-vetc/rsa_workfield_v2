# Workfield — Mobile Cứu hộ Tài xế v3.2

App preview Tài xế cứu hộ VETC, tách riêng khỏi `rsa-design` (Portal CMS).

- **App:** `src/`
- **Thư viện DLS mobile:** `dls/` (tokens + components)
- **Token nguồn:** `../Test/tasco-dls-v1.2.json`
- Dữ liệu mock — API tích hợp sau

## Chạy local

```bash
cd rsa-driver-mobile
npm install
npm run dev
```

Mở http://127.0.0.1:5190/

## Build

```bash
npm run build
npm run preview
```

## Cấu trúc

```
rsa-driver-mobile/
  dls/              # Tasco DLS mobile — tái sử dụng độc lập
    tokens.css
    components.tsx
    components.css
  src/
    pages/          # Màn hình app
    components/     # Sheet, modal app-specific
    context/
    data/
```

## Luồng demo

1. **Đăng nhập** — user/pass bất kỳ → Home + modal vị trí
2. **Tài khoản khoá** — username `locked`
3. **Home** — lọc, toggle sẵn sàng cứu hộ, nhận/từ chối đơn
4. **Chi tiết** — tap card → `/orders/:id`
5. **Cứu hộ** — `/jobs/:id` (giai đoạn, map, camera, chi phí)
6. **Cài đặt** — đổi MK, đăng xuất

## Bản đồ màn hình

| Mã Figma | Route | Mô tả |
|----------|-------|--------|
| TX0001 | `/login` | Đăng nhập |
| TX0017 | `/forgot-password` | Quên mật khẩu |
| O0001 | `/otp` | Xác thực OTP |
| TX0016 | `/new-password` | Đặt mật khẩu mới |
| TX0018 | `/account-locked` | Tài khoản khoá |
| TX0002 / TX0020 | `/home` | Danh sách đơn |
| TX0012 | sheet | Bộ lọc |
| TX0003–TX0007 | `/orders/:id` | Chi tiết đơn |
| TX0019 | `/jobs/:id` | Điều hướng cứu hộ |
| TX0008 | `/jobs/:id/map` | Bản đồ |
| TX0014 | `/jobs/:id/camera` | Chụp ảnh |
| TX0010 | sheet | Lý do từ chối |
| TX0011 | sheet | Đánh giá |
| TX0013 | `/settings` | Cài đặt |
