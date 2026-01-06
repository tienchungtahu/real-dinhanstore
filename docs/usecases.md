# Tài liệu Use Cases - Dinhan Store

Tài liệu này mô tả chi tiết các Use Case (Trường hợp sử dụng) cho hệ thống thương mại điện tử Dinhan Store, bao gồm Use Case tổng quát và các Use Case phân rã chi tiết.

## 1. Các Actor (Tác nhân)

Hệ thống có 3 tác nhân chính:

1.  **Khách vãng lai (Guest):** Người dùng chưa đăng nhập vào hệ thống.
2.  **Khách hàng (Customer):** Người dùng đã đăng ký và đăng nhập tài khoản thành viên.
3.  **Quản trị viên (Admin):** Người dùng có quyền truy cập vào trang quản trị để vận hành hệ thống.

---

## 2. Use Case Tổng Quát

Biểu đồ bao quát các nhóm chức năng chính của từng Actor.

### 2.1. Khách vãng lai (Guest)
*   **Tìm kiếm & Duyệt sản phẩm:** Xem danh sách, chi tiết sản phẩm, tìm kiếm, lọc theo danh mục.
*   **Quản lý giỏ hàng:** Thêm sản phẩm vào giỏ, xem giỏ hàng (lưu cục bộ hoặc yêu cầu đăng nhập tùy cấu hình).
*   **Đăng ký / Đăng nhập:** Tạo tài khoản mới hoặc đăng nhập vào hệ thống (thông qua Clerk).
*   **Đổi ngôn ngữ:** Chuyển đổi ngôn ngữ hiển thị (Việt, Anh, Trung, Nhật, Hàn).

### 2.2. Khách hàng (Customer)
*   *Bao gồm tất cả các Use Case của Guest.*
*   **Thanh toán (Checkout):** Thực hiện đặt hàng và thanh toán (Stripe, VietQR).
*   **Quản lý tài khoản:** Cập nhật thông tin cá nhân, avatar.
*   **Quản lý sổ địa chỉ:** Thêm, sửa, xóa địa chỉ giao hàng.
*   **Quản lý đơn hàng:** Xem lịch sử mua hàng, theo dõi trạng thái đơn hàng.

### 2.3. Quản trị viên (Admin)
*   **Quản lý tổng quan (Dashboard):** Xem thống kê doanh thu, đơn hàng mới.
*   **Quản lý Sản phẩm (Products):** Thêm, sửa, xóa, quản lý tồn kho, upload ảnh.
*   **Quản lý Đơn hàng (Orders):** Xem chi tiết, cập nhật trạng thái đơn hàng.
*   **Quản lý Người dùng (Users):** Xem danh sách người dùng, phân quyền.
*   **Quản lý Khuyến mãi (Promotions):** Tạo và quản lý mã giảm giá, chương trình khuyến mãi.
*   **Cấu hình hệ thống:** Cài đặt database, các tham số hệ thống.

---

## 3. Use Case Phân Rã (Chi tiết)

### 3.1. Nhóm Authentication (Xác thực)
| ID | Tên Use Case | Actor | Mô tả sơ lược |
| :--- | :--- | :--- | :--- |
| **UC-AUTH-01** | Đăng ký | Guest | Người dùng tạo tài khoản mới qua form hoặc Social Login (Google, Github...). |
| **UC-AUTH-02** | Đăng nhập | Guest | Người dùng xác thực để vào hệ thống. |
| **UC-AUTH-03** | Đăng xuất | Customer, Admin | Kết thúc phiên làm việc. |
| **UC-AUTH-04** | Quên mật khẩu | Guest | Quy trình khôi phục mật khẩu qua email. |

### 3.2. Nhóm Sản phẩm (Catalog)
| ID | Tên Use Case | Actor | Mô tả sơ lược |
| :--- | :--- | :--- | :--- |
| **UC-PROD-01** | Xem danh sách SP | All | Hiển thị Grid/List sản phẩm, phân trang. |
| **UC-PROD-02** | Xem chi tiết SP | All | Xem thông tin chi tiết, giá, mô tả, ảnh, thông số. |
| **UC-PROD-03** | Tìm kiếm SP | All | Tìm theo tên hoặc từ khóa liên quan. |
| **UC-PROD-04** | Lọc & Sắp xếp | All | Lọc theo danh mục, giá, thương hiệu; Sắp xếp theo giá, mới nhất. |

### 3.3. Nhóm Mua hàng (Shopping & Checkout)
| ID | Tên Use Case | Actor | Mô tả sơ lược |
| :--- | :--- | :--- | :--- |
| **UC-CART-01** | Thêm vào giỏ | All | Chọn sản phẩm, số lượng và thêm vào giỏ hàng. |
| **UC-CART-02** | Cập nhật giỏ hàng | All | Tăng/giảm số lượng, xóa sản phẩm khỏi giỏ. |
| **UC-CART-03** | Áp dụng mã giảm giá | Customer | Nhập coupon code để được giảm giá. |
| **UC-ORDER-01** | Chọn địa chỉ | Customer | Chọn địa chỉ từ sổ địa chỉ hoặc nhập mới. |
| **UC-ORDER-02** | Thanh toán | Customer | Chọn phương thức (Stripe/VietQR) và hoàn tất thanh toán. |

### 3.4. Nhóm Cá nhân (Account)
| ID | Tên Use Case | Actor | Mô tả sơ lược |
| :--- | :--- | :--- | :--- |
| **UC-ACC-01** | Xem hồ sơ | Customer | Xem thông tin cá nhân hiện tại. |
| **UC-ACC-02** | Cập nhật hồ sơ | Customer | Sửa tên, số điện thoại. |
| **UC-ACC-03** | Quản lý địa chỉ | Customer | CRUD các địa chỉ giao hàng (đặt địa chỉ mặc định). |
| **UC-ACC-04** | Lịch sử đơn hàng | Customer | Xem danh sách các đơn hàng đã đặt. |
| **UC-ACC-05** | Chi tiết đơn hàng | Customer | Xem chi tiết từng đơn hàng (sản phẩm, giá, trạng thái). |

### 3.5. Nhóm Quản trị (Admin Core)
| ID | Tên Use Case | Actor | Mô tả sơ lược |
| :--- | :--- | :--- | :--- |
| **UC-ADM-01** | Xem Dashboard | Admin | Biểu đồ doanh thu, thống kê nhanh (Orders, Users, Revenue). |
| **UC-ADM-02** | Quản lý Sản phẩm | Admin | CRUD sản phẩm. Thiết lập giá, sale, tồn kho, Featured. |
| **UC-ADM-03** | Quản lý Danh mục | Admin | CRUD danh mục sản phẩm (Category). |
| **UC-ADM-04** | Quản lý Đơn hàng | Admin | Xem danh sách đơn, lọc theo trạng thái, cập nhật trạng thái (Delivery, Completed). |
| **UC-ADM-05** | Quản lý Khuyến mãi | Admin | Tạo các Promotion (discount percent/fixed), set ngày bắt đầu/kết thúc. |
| **UC-ADM-06** | Phân tích (Analytics) | Admin | Xem báo cáo doanh thu chi tiết theo thời gian thực (Timezone UTC+7). |
