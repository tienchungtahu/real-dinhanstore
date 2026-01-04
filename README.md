# Dinhan Store 🏸

Website thương mại điện tử chuyên bán dụng cụ cầu lông chính hãng.

**Live Demo:** [https://nguyendinhan.id.vn](https://nguyendinhan.id.vn)

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Reference](#api-reference)
- [Hướng dẫn phát triển](#hướng-dẫn-phát-triển)

---

## Giới thiệu

Dinhan Store là một nền tảng e-commerce hiện đại được xây dựng với Next.js 16, hỗ trợ đa ngôn ngữ và tích hợp nhiều phương thức thanh toán. Website được thiết kế responsive, tối ưu cho cả desktop và mobile.

### Dành cho người dùng

- Duyệt và tìm kiếm sản phẩm cầu lông (vợt, giày, phụ kiện)
- Giỏ hàng với tính năng lưu trữ
- Thanh toán qua Stripe hoặc VietQR
- Theo dõi đơn hàng và lịch sử mua hàng
- Hỗ trợ 5 ngôn ngữ: Tiếng Việt, English, 中文, 日本語, 한국어
- Chatbot hỗ trợ khách hàng

### Dành cho quản trị viên

- Dashboard tổng quan với biểu đồ doanh thu
- Quản lý sản phẩm, danh mục, đơn hàng
- Quản lý người dùng và phân quyền
- Hệ thống giảm giá và khuyến mãi theo lịch
- Phân tích doanh thu theo thời gian (UTC+7)
- Quản lý database trực tiếp

---

## Tính năng

### 🛒 Khách hàng
| Tính năng | Mô tả |
|-----------|-------|
| Catalog sản phẩm | Hiển thị sản phẩm theo danh mục, lọc và sắp xếp |
| Tìm kiếm | Tìm kiếm sản phẩm theo tên, mô tả |
| Giỏ hàng | Thêm/xóa sản phẩm, cập nhật số lượng |
| Checkout | Thanh toán Stripe (quốc tế) hoặc VietQR (nội địa) |
| Tài khoản | Đăng ký/đăng nhập qua Clerk, quản lý địa chỉ |
| Đa ngôn ngữ | 5 ngôn ngữ với next-intl |
| Chatbot | Hỗ trợ tư vấn sản phẩm |

### 👨‍💼 Quản trị
| Tính năng | Mô tả |
|-----------|-------|
| Dashboard | Thống kê doanh thu, đơn hàng, sản phẩm bán chạy |
| Sản phẩm | CRUD sản phẩm, upload ảnh, quản lý tồn kho |
| Đơn hàng | Xem, cập nhật trạng thái đơn hàng |
| Người dùng | Quản lý tài khoản, phân quyền admin |
| Giảm giá | Giảm giá hàng loạt, khuyến mãi theo lịch (Tết, Giáng sinh...) |
| Analytics | Biểu đồ doanh thu theo ngày/tuần/tháng |
| Database | Khởi tạo, seed data, reset database |

---

## Công nghệ sử dụng

### Frontend
- **Next.js 16** - React framework với App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Headless components
- **Lucide React** - Icons
- **Recharts** - Charts
- **Zustand** - State management

### Backend
- **Next.js API Routes** - REST API
- **Prisma** - ORM
- **MySQL** - Database

### Services
- **Clerk** - Authentication
- **Stripe** - Payment processing
- **VietQR** - QR payment (Vietnam)
- **Nodemailer** - Email notifications

### DevOps
- **Vercel** - Hosting
- **Turbopack** - Build tool

---

## Cài đặt

### Yêu cầu
- Node.js 18+
- MySQL database
- Tài khoản Clerk, Stripe

### Bước 1: Clone repository
```bash
git clone https://github.com/your-username/dinhanstore.git
cd dinhanstore
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình môi trường
Tạo file `.env.local` (xem phần [Cấu hình môi trường](#cấu-hình-môi-trường))

### Bước 4: Khởi tạo database
```bash
npx prisma db push
```

### Bước 5: Chạy development server
```bash
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000)

---

## Cấu hình môi trường

Tạo file `.env.local` với các biến sau:

```env
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Stripe Payment
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx

# VietQR (Vietnam QR Payment)
NEXT_PUBLIC_VIETQR_BANK_ID=970422
NEXT_PUBLIC_VIETQR_BANK_ACCOUNT=your_account
NEXT_PUBLIC_VIETQR_NAME=your_name

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

---

## Cấu trúc dự án

```
dinhanstore/
├── app/
│   ├── [locale]/           # Trang public (i18n)
│   │   ├── page.tsx        # Trang chủ
│   │   ├── products/       # Trang sản phẩm
│   │   ├── checkout/       # Trang thanh toán
│   │   └── account/        # Trang tài khoản
│   ├── admin/              # Trang quản trị
│   │   ├── page.tsx        # Dashboard
│   │   ├── products/       # Quản lý sản phẩm
│   │   ├── orders/         # Quản lý đơn hàng
│   │   ├── users/          # Quản lý người dùng
│   │   ├── discounts/      # Quản lý giảm giá
│   │   ├── analytics/      # Phân tích doanh thu
│   │   ├── settings/       # Cài đặt
│   │   └── database/       # Quản lý database
│   ├── api/                # API Routes
│   │   ├── products/       # CRUD sản phẩm
│   │   ├── orders/         # CRUD đơn hàng
│   │   ├── users/          # CRUD người dùng
│   │   ├── cart/           # Giỏ hàng
│   │   ├── checkout/       # Thanh toán (Stripe, VietQR)
│   │   ├── promotions/     # Khuyến mãi
│   │   ├── analytics/      # Thống kê
│   │   └── webhooks/       # Webhooks (Clerk, Stripe)
│   ├── components/         # React components
│   │   ├── home/           # Components trang chủ
│   │   ├── cart/           # Components giỏ hàng
│   │   ├── auth/           # Components xác thực
│   │   ├── chat/           # Chatbot
│   │   └── ui/             # UI components
│   └── hooks/              # Custom hooks
│       ├── useCartStore.tsx
│       ├── useProductStore.tsx
│       └── useDiscountStore.tsx
├── components/ui/          # Shadcn UI components
├── i18n/                   # Cấu hình đa ngôn ngữ
├── lib/                    # Utilities
│   ├── db/prisma.ts        # Prisma client
│   └── email/mailer.ts     # Email service
├── messages/               # Translation files
│   ├── vi.json
│   ├── en.json
│   ├── zh.json
│   ├── ja.json
│   └── ko.json
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                 # Static files
```

---

## API Reference

### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Lấy danh sách sản phẩm |
| GET | `/api/products/[id]` | Lấy chi tiết sản phẩm |
| POST | `/api/products` | Tạo sản phẩm mới |
| PUT | `/api/products/[id]` | Cập nhật sản phẩm |
| DELETE | `/api/products/[id]` | Xóa sản phẩm |
| GET | `/api/products/sales-stats` | Thống kê bán hàng |
| POST | `/api/products/bulk-discount` | Giảm giá hàng loạt |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/orders` | Lấy danh sách đơn hàng |
| GET | `/api/orders/[id]` | Chi tiết đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng |
| PUT | `/api/orders/[id]` | Cập nhật trạng thái |

### Checkout
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/checkout/stripe` | Tạo Stripe session |
| POST | `/api/checkout/vietqr` | Tạo VietQR payment |
| GET | `/api/checkout/verify` | Xác nhận thanh toán |

### Promotions
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/promotions` | Lấy danh sách khuyến mãi |
| POST | `/api/promotions` | Tạo khuyến mãi |
| DELETE | `/api/promotions/[id]` | Xóa khuyến mãi |
| POST | `/api/promotions/apply` | Áp dụng khuyến mãi |

---

## Hướng dẫn phát triển

### Scripts

```bash
# Development
npm run dev          # Chạy dev server với Turbopack

# Build
npm run build        # Build production

# Database
npm run db:push      # Sync schema với database
npm run db:migrate   # Chạy migrations
npm run db:studio    # Mở Prisma Studio

# Lint
npm run lint         # Chạy ESLint
```

### Database Schema

Các model chính:
- **User** - Người dùng (sync từ Clerk)
- **Product** - Sản phẩm
- **Category** - Danh mục
- **Order** - Đơn hàng
- **OrderItem** - Chi tiết đơn hàng
- **Cart/CartItem** - Giỏ hàng
- **Address** - Địa chỉ giao hàng
- **Promotion** - Chương trình khuyến mãi

### Timezone

Project sử dụng **UTC+7 (Vietnam timezone)** cho tất cả các tính năng liên quan đến thời gian:
- Thống kê doanh thu
- Lịch khuyến mãi
- Hiển thị ngày tháng

### Thêm ngôn ngữ mới

1. Thêm locale vào `i18n/routing.ts`
2. Tạo file translation trong `messages/`
3. Cập nhật `localeNames` và `localeFlags`

### Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình Environment Variables
4. Deploy

---

## License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## Tác giả

**Nguyễn Đình An**
- Website: [nguyendinhan.id.vn](https://nguyendinhan.id.vn)
