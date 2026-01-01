# Server – Ứng dụng "Đi Chợ Tiện Lợi" (IT4788)

Chào mừng đội ngũ phát triển đến với **Repository Backend** của dự án **"Đi chợ tiện lợi"**. Tài liệu này cung cấp cái nhìn tổng quan về hệ thống, các module nghiệp vụ và luồng dữ liệu chính giúp Frontend tích hợp API hiệu quả.

---

## 1. Tổng quan dự án

**"Đi chợ tiện lợi"** là ứng dụng di động hỗ trợ quản lý sinh hoạt gia đình, tập trung vào việc đi chợ, nấu ăn và quản lý thực phẩm.

### Mục tiêu cốt lõi

* **Đi chợ không sót**: Lên danh sách mua sắm, chia sẻ giữa các thành viên gia đình.
* **Tủ lạnh thông minh**: Biết được trong tủ còn gì, cái gì sắp hết hạn.
* **Hôm nay ăn gì**: Lên kế hoạch bữa ăn dựa trên thực phẩm có sẵn.

---

## 2. Luồng dữ liệu chính (Data Flow)

Để Frontend hiển thị đúng dữ liệu, cần hiểu các khái niệm cốt lõi sau:

### 🌟 Khái niệm "Nhóm Gia Đình" (Family Group) là trung tâm

Hệ thống không hoạt động theo cá nhân đơn lẻ mà hoạt động theo **Nhóm (Group)**.

* User sau khi đăng ký sẽ cần **tạo hoặc tham gia một Group**.
* **Shopping List**, **Fridge**, **Meal Plan** đều gắn liền với `groupId`.

**Ý nghĩa**: Khi một người đi chợ (tick vào task đã mua), tất cả thành viên khác trong gia đình đều thấy cập nhật đó tức thì.

### 🔄 Vòng đời của một "Món ăn" (Food Lifecycle)

Đây là luồng dữ liệu quan trọng nhất Frontend cần nắm:

1. **Định nghĩa (Master Data)**
   Trước khi mua hay cất tủ lạnh, món ăn phải được định nghĩa trong hệ thống (Model: `Food`).
   Một `Food` sẽ cần **Category** (Thịt, Rau...) và **Unit** (kg, bó...).

2. **Lên danh sách (Shopping)**
   Người dùng chọn `Food` để thêm vào danh sách cần mua (`ShoppingList -> Task`).

3. **Lưu kho (Fridge)**
   Sau khi mua, món ăn được thêm vào tủ lạnh (`FridgeItem`).
   Lúc này nó sẽ có thêm thuộc tính: **Hạn sử dụng (`useWithin`)** và **Số lượng thực tế**.

4. **Tiêu thụ (Cooking / Meal Plan)**
   Lên lịch nấu ăn (`MealPlan`) hoặc lấy ra khỏi tủ lạnh để chế biến (Xóa/Update `FridgeItem`).

---

## 3. Các Module Nghiệp vụ

### 🔐 1. Authentication & User

* Quản lý đăng ký, đăng nhập, quên mật khẩu.
* Quản lý **Profile** cá nhân.

> **Lưu ý**: User cần có `groupId` để sử dụng các tính năng chính.

---

### 👥 2. Group Management

* Tạo nhóm mới (User tạo sẽ là **Admin** nhóm).
* Thêm / Xóa thành viên.

**Logic**: Chỉ **Admin nhóm** mới có quyền quản lý thành viên.

---

### 🍖 3. Food & Master Data (Admin System)

* **Category & Unit**: Dữ liệu nền tảng (Ví dụ: Loại *"Thực phẩm tươi sống"*, Đơn vị *"kg"*).
  Thường do **Admin hệ thống** tạo.

* **Food**: Danh sách các món ăn có sẵn trong hệ thống kèm hình ảnh.

* **Logic Upload**: Ảnh món ăn được lưu trữ tại server (`/uploads`).

---

### ❄️ 4. Smart Fridge (Tủ lạnh)

* Quản lý các món đang có trong tủ.

* **Logic**: Kiểm tra trùng lặp. Nếu thêm một món đã có, hệ thống có thể báo lỗi hoặc yêu cầu cập nhật số lượng.

* **Tính năng**: Theo dõi hạn sử dụng để nhắc nhở
  (Logic xử lý ở client dựa trên `useWithin`).

---

### 🛒 5. Shopping List (Đi chợ)

* **List**: Một chuyến đi chợ
  (Ví dụ: *"Đi siêu thị cuối tuần"*).

* **Task**: Các việc cần làm trong list đó
  (Ví dụ: *Mua 2kg thịt bò*, *Mua 1 bó rau*).

* **Assign**: Có thể giao nhiệm vụ mua sắm cho một thành viên cụ thể trong nhóm.

---

### 📅 6. Meal Plan & Recipe (Nấu nướng)

* **Recipe**: Công thức nấu ăn, hướng dẫn chi tiết
  (lưu dạng **HTML content**).

* **Meal Plan**: Lịch ăn uống (Sáng / Trưa / Tối) gắn với ngày cụ thể.

---

## 4. Yêu cầu kỹ thuật & Cài đặt

### Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB (sử dụng **Mongoose ODM**)
* **Auth**: JWT (JSON Web Token)
* **File Storage**: Local storage (Multer)

---

### Cấu hình môi trường (`.env`)

Để chạy dự án, cần tạo file `.env` với các biến sau:

```env
PORT=3000
MONGO_URI=mongodb://...        # Connection string MongoDB
JWT_SECRET=...                # Chuỗi bảo mật cho Token
```

---

### Hướng dẫn chạy (cho Frontend giả lập Local)

1. Clone repository.
2. Chạy `npm install` để cài đặt thư viện.
3. Đảm bảo **MongoDB** đã chạy.
4. Tạo thư mục `uploads/` ở root nếu chưa có (để lưu ảnh).
5. Chạy `npm run dev` (hoặc `node server.js`).

Server sẽ chạy tại:

```
http://localhost:3000
```

Static file (ảnh) truy cập qua:

```
http://localhost:3000/uploads/{filename}
```
