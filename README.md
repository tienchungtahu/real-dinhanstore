# Dinhan Store - E-commerce Cầu Lông

Website bán hàng cầu lông chuyên nghiệp với đầy đủ tính năng quản lý sản phẩm, đơn hàng và thanh toán online.

## 🚀 Tính năng

### 👤 Khách hàng
- **Xem sản phẩm**: Duyệt theo danh mục, tìm kiếm, lọc theo giá/thương hiệu
- **Giỏ hàng**: Thêm/xóa sản phẩm, lưu giỏ hàng khi đăng nhập
- **Thanh toán**: Stripe (thẻ quốc tế), VietQR (chuyển khoản)
- **Quản lý tài khoản**: Xem lịch sử đơn hàng, quản lý địa chỉ
- **Đa ngôn ngữ**: Tiếng Việt, English, 日本語, 한국어, 中文
- **AI Chatbot**: Hỗ trợ tư vấn sản phẩm 24/7 (Groq LLaMA)

### 🔐 Admin
- **Quản lý sản phẩm**: Thêm/sửa/xóa sản phẩm, upload ảnh
- **Quản lý đơn hàng**: Xem, cập nhật trạng thái đơn hàng
- **Thống kê doanh thu**: Biểu đồ theo ngày/tuần/tháng
- **Quản lý database**: Seed data, reset database

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: TiDB Cloud (MySQL compatible) + Prisma ORM
- **Authentication**: Clerk
- **Payment**: Stripe, VietQR
- **AI**: Groq (LLaMA 3.3 70B)
- **Deployment**: Vercel

## 📦 Cài đặt

### 1. Clone repository
```bash
git clone https://github.com/tienchungtahu/real-dinhanstore.git
cd real-dinhanstore
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment variables
Tạo file `.env.local`:
```env
# Database (TiDB Cloud hoặc MySQL)
DATABASE_URL="mysql://user:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Groq AI (Chatbot)
GROQ_API_KEY=gsk_xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Setup database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed sample data
# Truy cập: http://localhost:3000/api/db/seed
```

### 5. Chạy development server
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem website.

## 💳 Test Thanh toán Stripe

Sử dụng thẻ test của Stripe để thử nghiệm thanh toán:

| Loại thẻ | Số thẻ | Ngày hết hạn | CVC |
|----------|--------|--------------|-----|
| Visa (thành công) | `4242 4242 4242 4242` | Bất kỳ ngày tương lai | Bất kỳ 3 số |
| Visa (bị từ chối) | `4000 0000 0000 0002` | Bất kỳ ngày tương lai | Bất kỳ 3 số |
| Mastercard | `5555 5555 5555 4444` | Bất kỳ ngày tương lai | Bất kỳ 3 số |
| 3D Secure | `4000 0025 0000 3155` | Bất kỳ ngày tương lai | Bất kỳ 3 số |

**Lưu ý**: Chỉ hoạt động ở chế độ test mode của Stripe.

## 📁 Cấu trúc thư mục

```
├── app/
│   ├── [locale]/          # Pages đa ngôn ngữ
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── components/        # React components
├── lib/
│   └── db/                # Prisma client
├── prisma/
│   └── schema.prisma      # Database schema
├── messages/              # i18n translations
└── public/                # Static files
```

## 🔧 Scripts

```bash
npm run dev        # Chạy development server
npm run build      # Build production
npm run start      # Chạy production server
npm run db:push    # Sync Prisma schema với database
npm run db:studio  # Mở Prisma Studio
```

## 🌐 Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Thêm Environment Variables
4. Deploy!

## 📝 License

MIT License

## 👨‍💻 Author

Dinhan Store Team
