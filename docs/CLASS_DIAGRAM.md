# CLASS DIAGRAM - DINHAN STORE

## 1. Biểu đồ lớp tổng quát (Overview)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DINHAN STORE                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────┐
                                    │   Category  │
                                    ├─────────────┤
                                    │-id: Int     │
                                    │-name: String│
                                    │-slug: String│
                                    │-description │
                                    │-image       │
                                    └──────┬──────┘
                                           │ 1
                                           │
                                           │ 0..*
                                    ┌──────▼──────┐
     ┌──────────────┐               │   Product   │               ┌──────────────┐
     │     User     │               ├─────────────┤               │  Promotion   │
     ├──────────────┤               │-id: Int     │               ├──────────────┤
     │-id: Int      │               │-name: String│               │-id: Int      │
     │-clerkId     │               │-slug: String│               │-name: String │
     │-firstName   │               │-description │               │-discountType │
     │-lastName    │               │-price:Decimal│              │-discountValue│
     │-email       │               │-salePrice   │               │-startDate    │
     │-phone       │               │-stock: Int  │               │-endDate      │
     │-avatar      │               │-brand       │               │-isActive     │
     │-address     │               │-images      │               │-productIds   │
     │-role        │               │-isActive    │               ├──────────────┤
     │-isActive    │               │-isFeatured  │               │+apply()      │
     │-points      │               │-categoryId  │               │+isValid()    │
     ├──────────────┤               ├─────────────┤               └──────────────┘
     │+login()     │               │+getInfo()   │                      │
     │+logout()    │               │+updateStock()│                     │ 0..*
     │+updateInfo()│               │+applyDiscount()                    │
     └──────┬──────┘               └──────┬──────┘◄─────────────────────┘
            │ 1                           │
            │                             │ 0..*
            │ 0..*                        │
     ┌──────▼──────┐               ┌──────▼──────┐
     │   Address   │               │  CartItem   │
     ├─────────────┤               ├─────────────┤
     │-id: Int     │               │-id: Int     │
     │-userId: Int │               │-cartId: Int │
     │-fullName   │               │-productId   │
     │-phone      │               │-quantity    │
     │-province   │               ├─────────────┤
     │-district   │               │+getSubtotal()│
     │-ward       │               └──────┬──────┘
     │-addressDetail│                    │ 1..*
     │-isDefault  │                      │
     └─────────────┘                     │ 1
            │                     ┌──────▼──────┐
            │                     │    Cart     │
            │                     ├─────────────┤
            │                     │-id: Int     │
            │                     │-userId: Int │
            │                     │-discountCode│
            │                     │-discountPercent
            │                     ├─────────────┤
            │                     │+addItem()   │
            │                     │+removeItem()│
            │                     │+getTotal()  │
            │                     │+clear()     │
            │                     └──────┬──────┘
            │                            │ 1
            │ 1                          │
     ┌──────┴───────────────────────────▼──────┐
     │                  User                    │
     └──────────────────┬──────────────────────┘
                        │ 1
                        │
                        │ 0..*
                 ┌──────▼──────┐
                 │    Order    │
                 ├─────────────┤
                 │-id: Int     │
                 │-orderNumber │
                 │-customerName│
                 │-customerEmail
                 │-customerPhone
                 │-shippingAddress
                 │-subtotal    │
                 │-shippingFee │
                 │-discount    │
                 │-total       │
                 │-status      │
                 │-paymentMethod
                 │-paymentStatus
                 │-stripeSessionId
                 │-note        │
                 │-userId      │
                 ├─────────────┤
                 │+create()    │
                 │+updateStatus()
                 │+cancel()    │
                 └──────┬──────┘
                        │ 1
                        │
                        │ 1..*
                 ┌──────▼──────┐
                 │  OrderItem  │
                 ├─────────────┤
                 │-id: Int     │
                 │-orderId: Int│
                 │-productId   │
                 │-productName │
                 │-productSnapshot
                 │-price       │
                 │-quantity    │
                 │-total       │
                 ├─────────────┤
                 │+getTotal()  │
                 └─────────────┘
```

---

## 2. Chi tiết các Class và Quan hệ

### 2.1. Bảng mô tả Class

| Class | Mô tả | Thuộc tính chính |
|-------|-------|------------------|
| **User** | Người dùng hệ thống | id, clerkId, email, role, points |
| **Address** | Địa chỉ giao hàng | userId, fullName, phone, province, district, ward |
| **Category** | Danh mục sản phẩm | name, slug, description, image |
| **Product** | Sản phẩm | name, price, salePrice, stock, categoryId |
| **Cart** | Giỏ hàng | userId, discountCode, discountPercent |
| **CartItem** | Chi tiết giỏ hàng | cartId, productId, quantity |
| **Order** | Đơn hàng | orderNumber, status, paymentStatus, total |
| **OrderItem** | Chi tiết đơn hàng | orderId, productId, quantity, price |
| **Promotion** | Chương trình khuyến mãi | discountType, discountValue, startDate, endDate |

---

### 2.2. Quan hệ giữa các Class (Associations)

| Quan hệ | Class A | Class B | Multiplicity | Mô tả |
|---------|---------|---------|--------------|-------|
| **has** | User | Address | 1 : 0..* | 1 User có nhiều Address |
| **has** | User | Cart | 1 : 0..* | 1 User có nhiều Cart |
| **has** | User | Order | 1 : 0..* | 1 User có nhiều Order |
| **contains** | Cart | CartItem | 1 : 1..* | 1 Cart chứa nhiều CartItem |
| **references** | CartItem | Product | * : 1 | Nhiều CartItem tham chiếu 1 Product |
| **contains** | Order | OrderItem | 1 : 1..* | 1 Order chứa nhiều OrderItem |
| **references** | OrderItem | Product | * : 1 | Nhiều OrderItem tham chiếu 1 Product |
| **belongs to** | Product | Category | * : 1 | Nhiều Product thuộc 1 Category |
| **applies to** | Promotion | Product | * : * | Promotion áp dụng cho nhiều Product |

---

### 2.3. Sơ đồ quan hệ chi tiết (ER-style)

```
┌──────────┐       1        0..*  ┌──────────┐
│   User   │─────────────────────│ Address  │
└──────────┘                      └──────────┘
     │ 1
     │
     │ 0..*
┌────▼─────┐       1        1..*  ┌──────────┐      *         1   ┌──────────┐
│   Cart   │─────────────────────│ CartItem │──────────────────│ Product  │
└──────────┘                      └──────────┘                    └──────────┘
     │                                                                 │ *
     │                                                                 │
     │ 0..*                                                           │ 1
┌────▼─────┐       1        1..*  ┌──────────┐                  ┌─────▼────┐
│  Order   │─────────────────────│OrderItem │                  │ Category │
└──────────┘                      └──────────┘                  └──────────┘
                                       │ *
                                       │
                                       │ 1
                                 ┌─────▼────┐
                                 │ Product  │
                                 └──────────┘
                                       │ *
                                       │
                                       │ *
                                 ┌─────▼────┐
                                 │Promotion │
                                 └──────────┘
```

---

## 3. Chi tiết từng Class (StarUML format)

### 3.1. User
```
┌─────────────────────────────────┐
│            User                 │
├─────────────────────────────────┤
│ -id: Int {PK}                   │
│ -clerkId: String {unique}       │
│ -firstName: String              │
│ -lastName: String               │
│ -email: String {unique}         │
│ -phone: String                  │
│ -avatar: Text                   │
│ -address: Text                  │
│ -role: String = "customer"      │
│ -isActive: Boolean = true       │
│ -points: Decimal = 0            │
│ -createdAt: DateTime            │
│ -updatedAt: DateTime            │
├─────────────────────────────────┤
│ +login(): void                  │
│ +logout(): void                 │
│ +updateInfo(data): void         │
│ +getAddresses(): Address[]      │
│ +getOrders(): Order[]           │
│ +getCart(): Cart                │
│ +isAdmin(): Boolean             │
└─────────────────────────────────┘
```

### 3.2. Product
```
┌─────────────────────────────────┐
│           Product               │
├─────────────────────────────────┤
│ -id: Int {PK}                   │
│ -name: String                   │
│ -slug: String {unique}          │
│ -description: Text              │
│ -price: Decimal                 │
│ -salePrice: Decimal {nullable}  │
│ -stock: Int = 0                 │
│ -brand: String                  │
│ -images: Text (JSON)            │
│ -isActive: Boolean = true       │
│ -isFeatured: Boolean = false    │
│ -categoryId: Int {FK}           │
│ -createdAt: DateTime            │
│ -updatedAt: DateTime            │
├─────────────────────────────────┤
│ +getInfo(): ProductInfo         │
│ +updateStock(qty): void         │
│ +applyDiscount(type, value): void│
│ +clearDiscount(): void          │
│ +getCategory(): Category        │
│ +getEffectivePrice(): Decimal   │
│ +isInStock(): Boolean           │
└─────────────────────────────────┘
```

### 3.3. Category
```
┌─────────────────────────────────┐
│           Category              │
├─────────────────────────────────┤
│ -id: Int {PK}                   │
│ -name: String                   │
│ -slug: String {unique}          │
│ -description: Text              │
│ -image: String                  │
│ -subcategories: Text (JSON)     │
│ -createdAt: DateTime            │
├─────────────────────────────────┤
│ +getProducts(): Product[]       │
│ +getProductCount(): Int         │
└─────────────────────────────────┘
```

### 3.4. Cart
```
┌─────────────────────────────────┐
│             Cart                │
├─────────────────────────────────┤
│ -id: Int {PK}                   │
│ -userId: Int {FK}               │
│ -discountCode: String           │
│ -discountPercent: Decimal = 0   │
│ -createdAt: DateTime            │
│ -updatedAt: DateTime            │
├─────────────────────────────────┤
│ +addItem(productId, qty): void  │
│ +removeItem(productId): void    │
│ +updateQuantity(id, qty): void  │
│ +getItems(): CartItem[]         │
│ +getTotal(): Decimal            │
│ +getSubtotal(): Decimal         │
│ +clear(): void                  │
│ +applyDiscount(code): Boolean   │
│ +getItemCount(): Int            │
└─────────────────────────────────┘
```

### 3.5. CartItem
```
┌─────────────────────────────────┐
│           CartItem              │
├─────────────────────────────────┤
│ -id: Int {PK}                   │
│ -cartId: Int {FK}               │
│ -productId: Int {FK}            │
│ -quantity: Int                  │
│ -createdAt: DateTime            │
│ -updatedAt: DateTime            │
├─────────────────────────────────┤
│ +getProduct(): Product          │
│ +getSubtotal(): Decimal         │
│ +updateQuantity(qty): void      │
└─────────────────────────────────┘
```

### 3.6. Order
```
┌─────────────────────────────────┐
│            Order                │
├─────────────────────────────────┤
│ -id: Int {PK}                   │
│ -orderNumber: String {unique}   │
│ -customerName: String           │
│ -customerEmail: String          │
│ -customerPhone: String          │
│ -shippingAddress: Text          │
│ -subtotal: Decimal              │
│ -shippingFee: Decimal = 0       │
│ -discount: Decimal = 0          │
│ -total: Decimal                 │
│ -status: String = "pending"     │
│ -paymentMethod: String          │
│ -paymentStatus: String = "pending"│
│ -stripeSessionId: String        │
│ -note: String                   │
│ -userId: String {FK}            │
│ -createdAt: DateTime            │
│ -updatedAt: DateTime            │
├─────────────────────────────────┤
│ +create(data): Order            │
│ +updateStatus(status): void     │
│ +updatePaymentStatus(status): void│
│ +cancel(): void                 │
│ +getItems(): OrderItem[]        │
│ +calculateTotal(): Decimal      │
│ +generateOrderNumber(): String  │
└─────────────────────────────────┘
```

### 3.7. OrderItem
```
┌─────────────────────────────────┐
│          OrderItem              │
├─────────────────────────────────┤
│ -id: Int {PK}                   │
│ -orderId: Int {FK}              │
│ -productId: Int {FK, nullable}  │
│ -productSnapshot: JSON          │
│ -productName: String            │
│ -price: Decimal                 │
│ -quantity: Int                  │
│ -total: Decimal                 │
├─────────────────────────────────┤
│ +getTotal(): Decimal            │
│ +getProduct(): Product          │
└─────────────────────────────────┘
```

### 3.8. Address
```
┌─────────────────────────────────┐
│           Address               │
├─────────────────────────────────┤
│ -id: Int {PK}                   │
│ -userId: Int {FK}               │
│ -fullName: String               │
│ -phone: String                  │
│ -province: String               │
│ -district: String               │
│ -ward: String                   │
│ -addressDetail: Text            │
│ -isDefault: Boolean = false     │
│ -createdAt: DateTime            │
│ -updatedAt: DateTime            │
├─────────────────────────────────┤
│ +getFullAddress(): String       │
│ +setAsDefault(): void           │
└─────────────────────────────────┘
```

### 3.9. Promotion
```
┌─────────────────────────────────┐
│          Promotion              │
├─────────────────────────────────┤
│ -id: Int {PK}                   │
│ -name: String                   │
│ -description: Text              │
│ -discountType: String = "percent"│
│ -discountValue: Decimal         │
│ -startDate: DateTime            │
│ -endDate: DateTime              │
│ -isActive: Boolean = true       │
│ -productIds: Text (JSON)        │
│ -createdAt: DateTime            │
│ -updatedAt: DateTime            │
├─────────────────────────────────┤
│ +apply(): void                  │
│ +isValid(): Boolean             │
│ +getStatus(): String            │
│ +getProducts(): Product[]       │
└─────────────────────────────────┘
```

---

## 4. Tổng hợp quan hệ để vẽ trong StarUML

### Associations (Liên kết)

| # | From | To | Type | Multiplicity | Role/Name |
|---|------|-----|------|--------------|-----------|
| 1 | User | Address | Association | 1 → 0..* | has addresses |
| 2 | User | Cart | Association | 1 → 0..* | has carts |
| 3 | User | Order | Association | 1 → 0..* | places orders |
| 4 | Cart | CartItem | Composition | 1 → 1..* | contains items |
| 5 | CartItem | Product | Association | * → 1 | references product |
| 6 | Order | OrderItem | Composition | 1 → 1..* | contains items |
| 7 | OrderItem | Product | Association | * → 0..1 | references product |
| 8 | Product | Category | Association | * → 0..1 | belongs to category |
| 9 | Promotion | Product | Association | * → * | applies to products |

### Composition vs Aggregation

- **Composition (◆)**: Cart-CartItem, Order-OrderItem (xóa cha → xóa con)
- **Aggregation (◇)**: User-Address (xóa User có thể giữ Address)
- **Association (—)**: Các quan hệ còn lại

---

## 5. Gợi ý vẽ trong StarUML

1. **Tạo các Class** theo thứ tự: User → Category → Product → Cart → CartItem → Order → OrderItem → Address → Promotion

2. **Thêm Attributes** với visibility:
   - `-` private (thuộc tính)
   - `+` public (phương thức)

3. **Thêm Associations**:
   - Kéo từ class này sang class kia
   - Đặt multiplicity ở 2 đầu
   - Đặt tên quan hệ (role name)

4. **Sử dụng đúng loại quan hệ**:
   - Composition cho Cart-CartItem, Order-OrderItem
   - Association cho các quan hệ khác

5. **Thêm stereotype** nếu cần:
   - `<<entity>>` cho các class chính
   - `<<value object>>` cho Address
