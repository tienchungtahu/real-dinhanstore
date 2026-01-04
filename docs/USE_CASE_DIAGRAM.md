# USE CASE DIAGRAM - DINHAN STORE

## 1. Actors (Tác nhân)

| Actor | Mô tả |
|-------|-------|
| **Khách vãng lai (Guest)** | Người dùng chưa đăng nhập, có thể xem sản phẩm và thêm vào giỏ hàng |
| **Khách hàng (Customer)** | Người dùng đã đăng nhập, có thể đặt hàng và quản lý tài khoản |
| **Quản trị viên (Admin)** | Người quản lý hệ thống, có toàn quyền quản lý |
| **Hệ thống thanh toán (Payment System)** | Stripe, VietQR - xử lý thanh toán |
| **Hệ thống xác thực (Auth System)** | Clerk - xác thực người dùng |

---

## 2. Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DINHAN STORE SYSTEM                                     │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         QUẢN LÝ SẢN PHẨM                                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │ UC01: Xem    │  │ UC02: Tìm    │  │ UC03: Lọc   │  │ UC04: Xem    │    │    │
│  │  │ danh sách SP │  │ kiếm SP      │  │ SP theo     │  │ chi tiết SP  │    │    │
│  │  └──────────────┘  └──────────────┘  │ danh mục    │  └──────────────┘    │    │
│  │                                      └──────────────┘                      │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                              ▲                                                       │
│                              │ <<include>>                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         QUẢN LÝ GIỎ HÀNG                                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │ UC05: Thêm   │  │ UC06: Cập    │  │ UC07: Xóa   │  │ UC08: Xem    │    │    │
│  │  │ SP vào giỏ  │  │ nhật số lượng│  │ SP khỏi giỏ │  │ giỏ hàng     │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         XÁC THỰC & TÀI KHOẢN                                │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │ UC09: Đăng   │  │ UC10: Đăng   │  │ UC11: Đăng  │  │ UC12: Cập    │    │    │
│  │  │ ký tài khoản │  │ nhập         │  │ xuất        │  │ nhật profile │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  │  ┌──────────────┐  ┌──────────────┐                                        │    │
│  │  │ UC13: Quản   │  │ UC14: Xem    │                                        │    │
│  │  │ lý địa chỉ  │  │ lịch sử mua  │                                        │    │
│  │  └──────────────┘  └──────────────┘                                        │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         ĐẶT HÀNG & THANH TOÁN                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │ UC15: Đặt    │  │ UC16: Thanh  │  │ UC17: Thanh │  │ UC18: Xác    │    │    │
│  │  │ hàng         │──│ toán Stripe  │  │ toán VietQR │  │ nhận đơn hàng│    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  │         │                  │                 │                              │    │
│  │         │ <<extend>>       │ <<extend>>      │                              │    │
│  │         ▼                  ▼                 ▼                              │    │
│  │  ┌──────────────┐  ┌──────────────────────────────┐                        │    │
│  │  │ UC19: Theo   │  │ UC20: Nhận email xác nhận   │                        │    │
│  │  │ dõi đơn hàng │  └──────────────────────────────┘                        │    │
│  │  └──────────────┘                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         QUẢN TRỊ HỆ THỐNG (ADMIN)                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │ UC21: Quản   │  │ UC22: Quản   │  │ UC23: Quản  │  │ UC24: Quản   │    │    │
│  │  │ lý sản phẩm │  │ lý đơn hàng  │  │ lý người dùng│  │ lý danh mục  │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │ UC25: Quản   │  │ UC26: Xem    │  │ UC27: Quản  │  │ UC28: Quản   │    │    │
│  │  │ lý giảm giá │  │ thống kê     │  │ lý database │  │ lý cài đặt   │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 3. Ma trận Actor - Use Case

| Use Case | Guest | Customer | Admin | Payment System | Auth System |
|----------|:-----:|:--------:|:-----:|:--------------:|:-----------:|
| UC01: Xem danh sách sản phẩm | ✓ | ✓ | ✓ | | |
| UC02: Tìm kiếm sản phẩm | ✓ | ✓ | ✓ | | |
| UC03: Lọc SP theo danh mục | ✓ | ✓ | ✓ | | |
| UC04: Xem chi tiết sản phẩm | ✓ | ✓ | ✓ | | |
| UC05: Thêm SP vào giỏ hàng | ✓ | ✓ | | | |
| UC06: Cập nhật số lượng | ✓ | ✓ | | | |
| UC07: Xóa SP khỏi giỏ hàng | ✓ | ✓ | | | |
| UC08: Xem giỏ hàng | ✓ | ✓ | | | |
| UC09: Đăng ký tài khoản | ✓ | | | | ✓ |
| UC10: Đăng nhập | ✓ | | | | ✓ |
| UC11: Đăng xuất | | ✓ | ✓ | | ✓ |
| UC12: Cập nhật profile | | ✓ | | | |
| UC13: Quản lý địa chỉ | | ✓ | | | |
| UC14: Xem lịch sử mua hàng | | ✓ | | | |
| UC15: Đặt hàng | | ✓ | | | |
| UC16: Thanh toán Stripe | | ✓ | | ✓ | |
| UC17: Thanh toán VietQR | | ✓ | | ✓ | |
| UC18: Xác nhận đơn hàng | | ✓ | | ✓ | |
| UC19: Theo dõi đơn hàng | | ✓ | | | |
| UC20: Nhận email xác nhận | | ✓ | | | |
| UC21: Quản lý sản phẩm | | | ✓ | | |
| UC22: Quản lý đơn hàng | | | ✓ | | |
| UC23: Quản lý người dùng | | | ✓ | | |
| UC24: Quản lý danh mục | | | ✓ | | |
| UC25: Quản lý giảm giá | | | ✓ | | |
| UC26: Xem thống kê | | | ✓ | | |
| UC27: Quản lý database | | | ✓ | | |
| UC28: Quản lý cài đặt | | | ✓ | | |

---

## 4. Mối quan hệ giữa các Use Case

### 4.1. Quan hệ Include (<<include>>)

| Use Case chính | Include | Use Case phụ |
|----------------|---------|--------------|
| UC15: Đặt hàng | <<include>> | UC08: Xem giỏ hàng |
| UC15: Đặt hàng | <<include>> | UC10: Đăng nhập |
| UC16: Thanh toán Stripe | <<include>> | UC15: Đặt hàng |
| UC17: Thanh toán VietQR | <<include>> | UC15: Đặt hàng |
| UC21: Quản lý sản phẩm | <<include>> | UC10: Đăng nhập |
| UC22: Quản lý đơn hàng | <<include>> | UC10: Đăng nhập |
| UC25: Quản lý giảm giá | <<include>> | UC21: Quản lý sản phẩm |

### 4.2. Quan hệ Extend (<<extend>>)

| Use Case chính | Extend | Use Case mở rộng | Điều kiện |
|----------------|--------|------------------|-----------|
| UC15: Đặt hàng | <<extend>> | UC16: Thanh toán Stripe | Chọn thanh toán quốc tế |
| UC15: Đặt hàng | <<extend>> | UC17: Thanh toán VietQR | Chọn thanh toán nội địa |
| UC15: Đặt hàng | <<extend>> | UC20: Nhận email xác nhận | Đặt hàng thành công |
| UC21: Quản lý SP | <<extend>> | UC25: Quản lý giảm giá | Áp dụng khuyến mãi |
| UC09: Đăng ký | <<extend>> | UC10: Đăng nhập | Đăng ký thành công |

### 4.3. Quan hệ Generalization (Kế thừa)

```
        ┌─────────────┐
        │    User     │
        └──────┬──────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼─────┐  ┌──────▼─────┐
│   Guest    │  │  Customer  │
└────────────┘  └──────┬─────┘
                       │
                ┌──────▼─────┐
                │   Admin    │
                └────────────┘
```

- **Guest** kế thừa từ **User**: Có thể xem sản phẩm, thêm giỏ hàng
- **Customer** kế thừa từ **Guest**: Thêm khả năng đặt hàng, quản lý tài khoản
- **Admin** kế thừa từ **Customer**: Thêm khả năng quản trị hệ thống

---

## 5. Chi tiết Use Case

### UC01: Xem danh sách sản phẩm
- **Actor**: Guest, Customer, Admin
- **Mô tả**: Hiển thị danh sách sản phẩm với phân trang
- **Tiền điều kiện**: Không
- **Hậu điều kiện**: Danh sách sản phẩm được hiển thị
- **Luồng chính**:
  1. Actor truy cập trang sản phẩm
  2. Hệ thống lấy danh sách sản phẩm từ database
  3. Hiển thị sản phẩm với ảnh, tên, giá, giá sale (nếu có)

### UC05: Thêm sản phẩm vào giỏ hàng
- **Actor**: Guest, Customer
- **Mô tả**: Thêm sản phẩm vào giỏ hàng
- **Tiền điều kiện**: Sản phẩm còn hàng (stock > 0)
- **Hậu điều kiện**: Sản phẩm được thêm vào giỏ hàng
- **Luồng chính**:
  1. Actor chọn sản phẩm
  2. Actor nhấn "Thêm vào giỏ"
  3. Hệ thống kiểm tra tồn kho
  4. Hệ thống thêm sản phẩm vào giỏ hàng
  5. Hiển thị thông báo thành công
- **Luồng thay thế**:
  - 3a. Sản phẩm hết hàng → Hiển thị thông báo "Hết hàng"

### UC15: Đặt hàng
- **Actor**: Customer
- **Mô tả**: Tạo đơn hàng từ giỏ hàng
- **Tiền điều kiện**: 
  - Customer đã đăng nhập
  - Giỏ hàng không rỗng
- **Hậu điều kiện**: Đơn hàng được tạo với trạng thái "pending"
- **Luồng chính**:
  1. Customer xem giỏ hàng
  2. Customer nhấn "Đặt hàng"
  3. Hệ thống hiển thị form thông tin giao hàng
  4. Customer nhập thông tin (tên, SĐT, địa chỉ)
  5. Customer chọn phương thức thanh toán
  6. Hệ thống tạo đơn hàng
  7. Chuyển đến trang thanh toán
- **Include**: UC08 (Xem giỏ hàng), UC10 (Đăng nhập)
- **Extend**: UC16 (Stripe), UC17 (VietQR)

### UC16: Thanh toán Stripe
- **Actor**: Customer, Payment System (Stripe)
- **Mô tả**: Thanh toán qua thẻ quốc tế
- **Tiền điều kiện**: Đơn hàng đã được tạo
- **Hậu điều kiện**: Thanh toán thành công, đơn hàng chuyển sang "paid"
- **Luồng chính**:
  1. Hệ thống tạo Stripe Checkout Session
  2. Chuyển hướng đến trang thanh toán Stripe
  3. Customer nhập thông tin thẻ
  4. Stripe xử lý thanh toán
  5. Stripe gọi webhook xác nhận
  6. Hệ thống cập nhật trạng thái đơn hàng
  7. Gửi email xác nhận

### UC21: Quản lý sản phẩm
- **Actor**: Admin
- **Mô tả**: CRUD sản phẩm
- **Tiền điều kiện**: Admin đã đăng nhập
- **Hậu điều kiện**: Sản phẩm được tạo/sửa/xóa
- **Luồng chính**:
  1. Admin truy cập trang quản lý sản phẩm
  2. Hệ thống hiển thị danh sách sản phẩm
  3. Admin chọn thao tác (Thêm/Sửa/Xóa)
  4. Hệ thống thực hiện thao tác
  5. Hiển thị kết quả
- **Extend**: UC25 (Quản lý giảm giá)

### UC25: Quản lý giảm giá
- **Actor**: Admin
- **Mô tả**: Tạo và quản lý chương trình khuyến mãi
- **Tiền điều kiện**: Admin đã đăng nhập
- **Hậu điều kiện**: Khuyến mãi được tạo/áp dụng
- **Luồng chính**:
  1. Admin truy cập trang giảm giá
  2. Hệ thống hiển thị danh sách sản phẩm với thống kê bán hàng
  3. Admin chọn sản phẩm cần giảm giá
  4. Admin nhập % hoặc số tiền giảm
  5. Hệ thống áp dụng giảm giá
- **Luồng thay thế** (Khuyến mãi theo lịch):
  1. Admin tạo chương trình khuyến mãi mới
  2. Chọn ngày đặc biệt (Tết, Giáng sinh...)
  3. Đặt thời gian bắt đầu/kết thúc
  4. Chọn sản phẩm áp dụng
  5. Hệ thống tự động áp dụng khi đến thời điểm

---

## 6. Sequence Diagram - Luồng đặt hàng

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│Customer │     │  Cart   │     │  Order  │     │ Stripe  │     │  Email  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ viewCart()    │               │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │  cartItems    │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │ checkout()    │               │               │               │
     │──────────────────────────────>│               │               │
     │               │               │               │               │
     │               │  createOrder()│               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │               │ clearCart()   │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │ selectPayment(stripe)         │               │               │
     │──────────────────────────────>│               │               │
     │               │               │               │               │
     │               │               │createSession()│               │
     │               │               │──────────────>│               │
     │               │               │               │               │
     │               │               │  sessionUrl   │               │
     │               │               │<──────────────│               │
     │               │               │               │               │
     │ redirect to Stripe            │               │               │
     │<──────────────────────────────│               │               │
     │               │               │               │               │
     │ enterCardInfo()               │               │               │
     │──────────────────────────────────────────────>│               │
     │               │               │               │               │
     │               │               │  webhook      │               │
     │               │               │<──────────────│               │
     │               │               │               │               │
     │               │               │updateStatus() │               │
     │               │               │───────────────│               │
     │               │               │               │               │
     │               │               │ sendEmail()   │               │
     │               │               │──────────────────────────────>│
     │               │               │               │               │
     │ orderConfirmation             │               │               │
     │<──────────────────────────────│               │               │
     │               │               │               │               │
```

---

## 7. Activity Diagram - Quy trình mua hàng

```
                    ┌─────────────┐
                    │    Start    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Xem sản phẩm│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │Thêm vào giỏ │
                    └──────┬──────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Tiếp tục mua?  │
                  └───────┬────────┘
                    Yes   │   No
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
       ┌─────────────┐         ┌─────────────┐
       │ Xem sản phẩm│         │ Xem giỏ hàng│
       └─────────────┘         └──────┬──────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Đã đăng nhập? │
                              └───────┬───────┘
                                Yes   │   No
                          ┌───────────┴───────────┐
                          │                       │
                          ▼                       ▼
                   ┌─────────────┐         ┌─────────────┐
                   │ Nhập thông  │         │  Đăng nhập  │
                   │ tin giao hàng│         └──────┬──────┘
                   └──────┬──────┘                │
                          │                       │
                          ▼                       │
                   ┌─────────────┐                │
                   │Chọn thanh   │<───────────────┘
                   │toán         │
                   └──────┬──────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
       ┌─────────────┐         ┌─────────────┐
       │   Stripe    │         │   VietQR    │
       └──────┬──────┘         └──────┬──────┘
              │                       │
              ▼                       ▼
       ┌─────────────┐         ┌─────────────┐
       │ Nhập thẻ    │         │ Quét QR     │
       └──────┬──────┘         └──────┬──────┘
              │                       │
              └───────────┬───────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Xác nhận    │
                   │ thanh toán  │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Gửi email   │
                   │ xác nhận    │
                   └──────┬──────┘
                          │
                          ▼
                    ┌─────────────┐
                    │    End      │
                    └─────────────┘
```
